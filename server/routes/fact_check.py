"""Fact Check Routes - API endpoints for PDF fact checking with SSE progress."""
from flask import Blueprint, request, jsonify, Response
import json
from controllers.pdf_controller import extract_text_from_bytes
from controllers.llm_controller import extract_claims, verify_claim_with_sources
from controllers.exa_controller import search_claim
from views.response import success_response, error_response

fact_check_bp = Blueprint('fact_check', __name__)


@fact_check_bp.route('/api/upload', methods=['POST'])
def upload_pdf():
    """Upload PDF and extract text."""
    try:
        if 'file' not in request.files:
            return jsonify(error_response("No file provided")), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify(error_response("No file selected")), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify(error_response("File must be a PDF")), 400
        
        pdf_bytes = file.read()
        text = extract_text_from_bytes(pdf_bytes)
        
        if not text:
            return jsonify(error_response("Could not extract text from PDF")), 400
        
        return jsonify(success_response({
            "text": text,
            "filename": file.filename,
            "char_count": len(text)
        }, "PDF text extracted successfully"))
        
    except Exception as e:
        return jsonify(error_response(f"Error processing PDF: {str(e)}")), 500


@fact_check_bp.route('/api/analyze-stream', methods=['POST'])
def analyze_claims_stream():
    """Extract and verify claims with SSE progress updates."""
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify(error_response("No text provided")), 400
    
    text = data['text']
    
    def generate():
        try:
            # Step 1: Extract claims (10%)
            yield f"data: {json.dumps({'progress': 5, 'stage': 'Extracting claims from document...'})}\n\n"
            
            claims = extract_claims(text)
            
            if not claims:
                yield f"data: {json.dumps({'error': 'No verifiable claims found'})}\n\n"
                return
            
            yield f"data: {json.dumps({'progress': 15, 'stage': f'Found {len(claims)} claims. Starting verification...'})}\n\n"
            
            # Step 2: Verify each claim
            verified_claims = []
            total_claims = len(claims)
            
            for idx, claim in enumerate(claims):
                # Calculate progress: 15% to 95% spread across claims
                progress = 15 + int((idx / total_claims) * 80)
                yield f"data: {json.dumps({'progress': progress, 'stage': f'Verifying claim {idx + 1}/{total_claims}...'})}\n\n"
                
                # Search for evidence
                sources = search_claim(claim)
                
                # Verify with LLM
                verification = verify_claim_with_sources(claim, sources)
                
                verified_claims.append({
                    "claim": claim,
                    "status": verification.get("status", "false"),
                    "confidence": verification.get("confidence", 0),
                    "explanation": verification.get("explanation", ""),
                    "sources": sources[:3]
                })
            
            # Final result
            yield f"data: {json.dumps({'progress': 100, 'stage': 'Complete!'})}\n\n"
            
            result = {
                "done": True,
                "total_claims": len(claims),
                "verified_claims": verified_claims,
                "summary": {
                    "verified": sum(1 for c in verified_claims if c["status"] == "verified"),
                    "inaccurate": sum(1 for c in verified_claims if c["status"] == "inaccurate"),
                    "false": sum(1 for c in verified_claims if c["status"] == "false")
                }
            }
            yield f"data: {json.dumps(result)}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream', headers={
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    })


@fact_check_bp.route('/api/analyze', methods=['POST'])
def analyze_claims():
    """Extract and verify claims (non-streaming fallback)."""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify(error_response("No text provided")), 400
        
        text = data['text']
        claims = extract_claims(text)
        
        if not claims:
            return jsonify(error_response("No verifiable claims found in text")), 400
        
        verified_claims = []
        for claim in claims:
            sources = search_claim(claim)
            verification = verify_claim_with_sources(claim, sources)
            
            verified_claims.append({
                "claim": claim,
                "status": verification.get("status", "false"),
                "confidence": verification.get("confidence", 0),
                "explanation": verification.get("explanation", ""),
                "sources": sources[:3]
            })
        
        return jsonify(success_response({
            "total_claims": len(claims),
            "verified_claims": verified_claims,
            "summary": {
                "verified": sum(1 for c in verified_claims if c["status"] == "verified"),
                "inaccurate": sum(1 for c in verified_claims if c["status"] == "inaccurate"),
                "false": sum(1 for c in verified_claims if c["status"] == "false")
            }
        }, "Claims analyzed successfully"))
        
    except Exception as e:
        return jsonify(error_response(f"Error analyzing claims: {str(e)}")), 500


@fact_check_bp.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify(success_response({"status": "healthy"}, "Server is running"))
