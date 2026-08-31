"""
AI-Powered Societal Innovation Collaboration Portal — AI microservice.

FastAPI service providing challenge analysis, duplicate/similarity
detection, and challenge-to-HEI matching. Mocked-but-architecturally-real
for the SIH prototype (see services/analysis.py and services/matching.py
for the exact swap-in points for real NLP / Sentence Transformers).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    ChallengeInput, AnalysisResult, SimilarResult, MatchResult,
)
from services.analysis import analyze_challenge
from services.matching import find_similar_challenges, match_universities

app = FastAPI(
    title="SIH Portal — AI Service",
    description="Challenge analysis, similarity detection, and HEI matching.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # prototype only — restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "sih-portal-ai-service"}


@app.post("/analyze", response_model=AnalysisResult)
def analyze(payload: ChallengeInput):
    result = analyze_challenge(payload.title, payload.description, payload.domain)
    return result


@app.post("/similar", response_model=SimilarResult)
def similar(payload: ChallengeInput):
    matches = find_similar_challenges(payload.title, payload.description)
    return {"similar_challenges": matches}


@app.post("/match-heis", response_model=MatchResult)
def match_heis(payload: ChallengeInput):
    matches = match_universities(payload.title, payload.description, payload.domain)
    return {"matches": matches}
