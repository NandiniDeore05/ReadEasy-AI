
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS, cross_origin
import torch
import nltk
import os
import re
import string

nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app,resources={r"/api/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
summarizer_tokenizer = AutoTokenizer.from_pretrained("pszemraj/led-large-book-summary")
summarizer_model = AutoModelForSeq2SeqLM.from_pretrained("pszemraj/led-large-book-summary").to(device)

sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2", tokenizer="deepset/roberta-base-squad2")

stop_words = set(nltk.corpus.stopwords.words('english'))
import random
import numpy as np

torch.manual_seed(42)
random.seed(42)
np.random.seed(42)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

def summarize_text(text):
    inputs = summarizer_tokenizer(
        text, return_tensors="pt", truncation=True, padding="longest", max_length=4096
    )
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)

    summary_ids = summarizer_model.generate(
        input_ids,
        attention_mask=attention_mask,
        max_length=261,
        min_length=80,
        num_beams=2,
        length_penalty=5.,
        top_p=0.9,
        top_k=10,
        early_stopping=True,
        temperature=0.5
    )
    return summarizer_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'\([^)]*\)', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(f"[{re.escape(string.punctuation.replace('.', '').replace('?', '').replace('!', ''))}]", "", text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def tfidf_qa(transcript, question, top_n=3, rerank_k=7):
    clean_transcript = preprocess_text(transcript)
    clean_question = preprocess_text(question)
    sentences = re.split(r'(?<=[.!?]) +', clean_transcript)
    corpus = [clean_question] + sentences

    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(corpus)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    top_indices = similarities.argsort()[::-1][:rerank_k]
    candidate_sentences = [sentences[i] for i in top_indices]

    q_embed = sbert_model.encode([question], convert_to_tensor=True)
    s_embed = sbert_model.encode(candidate_sentences, convert_to_tensor=True)
    cos_scores = util.cos_sim(q_embed, s_embed)[0]

    reranked = [candidate_sentences[i] for i in cos_scores.argsort(descending=True)[:top_n]]
    return reranked

def generate_answer(transcript, question, top_answers=3):
    answers = tfidf_qa(transcript, question, top_n=top_answers, rerank_k=7)
    results = set()
    for i in range(top_answers):
        context = answers[i]
        result = qa_pipeline({ 'context': context, 'question': question })
        results.add(result['answer'])

    return "\n".join([f"{idx}. {ans}" for idx, ans in enumerate(results, 1)])


@app.route('/summarize', methods=['POST'])
def summarize_endpoint():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files.get('file')
    text = file.read().decode('utf-8').strip()
    print(text)
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    summary = summarize_text(text)
    return jsonify({'summary': summary})

@app.route('/ask', methods=['POST'])
def ask_endpoint():
    file = request.files.get('file')
    question = request.form.get('question')

    if not file or not question:
        return jsonify({'error': 'File and question are required'}), 400

    text = file.read().decode('utf-8')
    numbered_answers = generate_answer(text, question)
    return jsonify({'answers': numbered_answers})


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response
@app.route('/hi', methods=['GET'])
def trail():
    print('hello')
    return jsonify({'answers': 'Hello, World!'})

if __name__ == '__main__':
    app.run(debug=True)
