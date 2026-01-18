"""Standardized JSON response formatters."""


def success_response(data, message="Success"):
    """Format successful response."""
    return {
        "success": True,
        "message": message,
        "data": data
    }


def error_response(message, code=400):
    """Format error response."""
    return {
        "success": False,
        "message": message,
        "error_code": code
    }


def claim_response(claim, status, confidence, sources):
    """Format individual claim verification response."""
    return {
        "claim": claim,
        "status": status,  # "verified", "inaccurate", "false"
        "confidence": confidence,
        "sources": sources
    }
