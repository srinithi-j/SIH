"""
Challenge analysis service.

Architecture note: this module is the seam where a real NLP pipeline
(domain classifier + severity/impact regressors, e.g. fine-tuned
sentence-transformer embeddings feeding a lightweight classifier head)
would plug in. For the SIH prototype we use deterministic keyword-based
mock scoring so the rest of the platform (Node backend, React frontend,
government workflows) can be built and demoed against a stable contract.

Swap point: replace `_mock_classify` with a call to a loaded
SentenceTransformer model + classifier, keeping the same return shape.
"""
import hashlib
from typing import Dict, List

DOMAIN_KEYWORDS = {
    "Water Management": ["water", "drinking", "borewell", "sanitation", "flood", "irrigation"],
    "Healthcare": ["health", "hospital", "disease", "medicine", "clinic", "maternal"],
    "Education": ["school", "education", "literacy", "student", "teacher", "dropout"],
    "Agriculture": ["farm", "crop", "agriculture", "soil", "irrigation", "farmer"],
    "Energy": ["electricity", "power", "solar", "energy", "grid"],
    "Environment": ["pollution", "waste", "forest", "environment", "climate"],
    "Infrastructure": ["road", "bridge", "transport", "infrastructure", "connectivity"],
    "Public Safety": ["safety", "lighting", "security", "crime", "streetlight", "police", "accident"],
    "Sanitation": ["sanitation", "toilet", "sewage", "waste", "drainage", "hygiene"],
    "Digital Access": ["internet", "wifi", "digital", "connectivity", "device", "network", "e-learning"],
    "Transport": ["transport", "road", "bus", "traffic", "commute", "mobility"],
}

SKILL_MAP = {
    "Water Management": ["IoT", "Water Quality Monitoring", "Data Analytics"],
    "Healthcare": ["Biomedical Engineering", "Telemedicine", "Public Health"],
    "Education": ["EdTech", "Mobile App Development", "Data Analytics"],
    "Agriculture": ["IoT", "Agri-Tech", "Remote Sensing"],
    "Energy": ["Renewable Energy", "IoT", "Power Systems"],
    "Environment": ["Environmental Engineering", "Data Analytics", "Remote Sensing"],
    "Infrastructure": ["Civil Engineering", "GIS", "Structural Analysis"],
    "Public Safety": ["IoT", "Smart Surveillance", "Public Infrastructure"],
    "Sanitation": ["Water Treatment", "Waste Management", "Public Health"],
    "Digital Access": ["Connectivity", "App Development", "Data Systems"],
    "Transport": ["Mobility Planning", "GIS", "Smart Infrastructure"],
}


def _score_from_text(text: str, salt: str) -> float:
    """Deterministic pseudo-score in [5.0, 9.8] derived from text hash,
    so repeated analysis of the same challenge is stable (mimics a real
    model being deterministic at inference time)."""
    h = hashlib.sha256((text + salt).encode()).hexdigest()
    bucket = int(h[:4], 16) % 480  # 0-479
    return round(5.0 + bucket / 100.0, 1)


def classify_domain(title: str, description: str, provided_domain: str | None) -> str:
    if provided_domain:
        return provided_domain

    text = f"{title} {description}".lower()
    best_domain = "General"
    best_hits = 0
    for domain, keywords in DOMAIN_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in text)
        if hits > best_hits:
            best_hits = hits
            best_domain = domain
    return best_domain


def analyze_challenge(title: str, description: str, domain: str | None) -> Dict:
    resolved_domain = classify_domain(title, description, domain)
    text = f"{title} {description}"

    severity = _score_from_text(text, "severity")
    impact = _score_from_text(text, "impact")

    if severity >= 8.5 or impact >= 8.5:
        priority = "Critical" if severity >= 9.3 else "High"
    elif severity >= 6.5:
        priority = "Medium"
    else:
        priority = "Low"

    required_skills: List[str] = SKILL_MAP.get(resolved_domain, ["Community Engagement", "Data Analytics"])

    return {
        "domain": resolved_domain,
        "priority": priority,
        "severity_score": severity,
        "impact_score": impact,
        "required_skills": required_skills,
    }
