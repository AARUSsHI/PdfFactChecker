"""Exa Controller - Use Exa Research API for claim verification."""
import os
from exa_py import Exa


def get_exa_client():
    """Initialize Exa client."""
    api_key = os.getenv("EXA_KEY")
    if not api_key:
        raise Exception("EXA_KEY not found in environment variables")
    return Exa(api_key)


def research_claim(claim, timeout=60):
    """Use Exa Research to find evidence for a claim."""
    try:
        exa = get_exa_client()
        
        # Create research request
        research = exa.research.create(
            instructions=f"Find factual evidence to verify or refute this claim: {claim}. Include sources with dates and statistics if available.",
            model="exa-research-fast",
        )
        
        # Collect research results
        results_text = ""
        sources = []
        
        for event in exa.research.get(research.research_id, stream=True):
            if hasattr(event, 'text'):
                results_text += event.text
            if hasattr(event, 'sources'):
                for source in event.sources:
                    sources.append({
                        "title": getattr(source, 'title', 'Source'),
                        "url": getattr(source, 'url', ''),
                        "text": getattr(source, 'text', '')[:500] if hasattr(source, 'text') else "",
                        "highlights": [],
                        "score": 1.0
                    })
        
        # If no structured sources, create one from the research text
        if not sources and results_text:
            sources.append({
                "title": "Exa Research Summary",
                "url": "",
                "text": results_text[:500],
                "highlights": [],
                "score": 1.0
            })
        
        return sources
        
    except Exception as e:
        print(f"Exa research error for claim '{claim[:50]}...': {str(e)}")
        # Fallback to search if research fails
        return search_claim_fallback(claim)


def search_claim_fallback(claim, num_results=5):
    """Fallback: Search the web for evidence related to a claim."""
    try:
        exa = get_exa_client()
        
        # Search for the claim
        results = exa.search_and_contents(
            claim,
            type="neural",
            num_results=num_results,
            text=True,
            highlights=True
        )
        
        sources = []
        for result in results.results:
            sources.append({
                "title": result.title,
                "url": result.url,
                "text": result.text[:500] if result.text else "",
                "highlights": result.highlights if hasattr(result, 'highlights') else [],
                "score": result.score if hasattr(result, 'score') else 0
            })
        
        return sources
    except Exception as e:
        print(f"Exa search fallback error for claim '{claim[:50]}...': {str(e)}")
        return []


def search_claim(claim, num_results=5):
    """Search for claim evidence - uses research API with search fallback."""
    return research_claim(claim)


def verify_claims_with_exa(claims):
    """Research each claim and return sources."""
    verified_claims = []
    
    for claim in claims:
        sources = search_claim(claim)
        verified_claims.append({
            "claim": claim,
            "sources": sources,
            "has_evidence": len(sources) > 0
        })
    
    return verified_claims
