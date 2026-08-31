"""Pydantic request/response schemas for the AI service."""
from typing import List, Optional
from pydantic import BaseModel


class ChallengeInput(BaseModel):
    title: str
    description: str
    domain: Optional[str] = None
    district: Optional[str] = None
    block: Optional[str] = None
    village: Optional[str] = None


class AnalysisResult(BaseModel):
    domain: str
    priority: str  # Low | Medium | High | Critical
    severity_score: float
    impact_score: float
    required_skills: List[str]


class SimilarChallenge(BaseModel):
    challenge_id: Optional[int] = None
    title: str
    similarity_score: float


class SimilarResult(BaseModel):
    similar_challenges: List[SimilarChallenge]


class HEIMatch(BaseModel):
    university_id: int
    university_name: str
    match_score: float
    reasons: List[str]


class MatchResult(BaseModel):
    matches: List[HEIMatch]
