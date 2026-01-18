"""LLM Controller - Use OpenRouter for claim extraction and verification."""
import os
import json
import requests
import time

# Correct free model names from OpenRouter (2025)
FREE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free"
]


def call_single_model(model, messages, timeout=45):
    """Call a single model on OpenRouter."""
    api_key = os.getenv("OPENROUTER_KEY")
    if not api_key:
        raise Exception("OPENROUTER_KEY not found in environment variables")
    
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": messages
        },
        timeout=timeout
    )
    
    return response


def get_openrouter_response(messages, system_prompt=None):
    """Call OpenRouter API with manual model fallback and retry."""
    full_messages = []
    if system_prompt:
        full_messages.append({"role": "system", "content": system_prompt})
    full_messages.extend(messages)
    
    last_error = None
    
    # Try each model
    for model in FREE_MODELS:
        try:
            print(f"Trying model: {model}")
            response = call_single_model(model, full_messages)
            
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content']
                print(f"✓ Success with model: {model}")
                return content
            elif response.status_code == 429:
                print(f"⚠ Rate limited on {model}, trying next...")
                last_error = f"Rate limited: {model}"
                time.sleep(2)
                continue
            else:
                error_text = response.text[:200]
                print(f"✗ Error {response.status_code} with {model}: {error_text}")
                last_error = f"{model}: {error_text}"
                continue
                
        except requests.exceptions.Timeout:
            print(f"⏱ Timeout on {model}")
            last_error = f"Timeout: {model}"
            continue
        except Exception as e:
            print(f"✗ Exception with {model}: {e}")
            last_error = str(e)
            continue
    
    raise Exception(f"All models failed. Last error: {last_error}")


def extract_claims(text):
    """Extract verifiable claims from text using LLM."""
    system_prompt = """Extract verifiable claims from the text. Return ONLY a JSON array of 3-5 claim strings.
Example: ["The company revenue was $5M in 2023", "Product launched in March 2024"]"""

    # Truncate to avoid token limits
    truncated_text = text[:3000]
    
    messages = [
        {"role": "user", "content": f"Extract verifiable claims:\n\n{truncated_text}"}
    ]
    
    try:
        response = get_openrouter_response(messages, system_prompt)
        response = response.strip()
        
        start_idx = response.find('[')
        end_idx = response.rfind(']') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response[start_idx:end_idx]
            claims = json.loads(json_str)
            return claims[:5]
        else:
            lines = [l.strip() for l in response.split('\n') if l.strip() and not l.startswith('#')]
            return lines[:5]
            
    except json.JSONDecodeError:
        return []
    except Exception as e:
        print(f"Claim extraction error: {e}")
        raise e


def verify_claim_with_sources(claim, sources):
    """Use LLM to analyze if sources support the claim."""
    system_prompt = """Return ONLY JSON: {"status": "verified" | "inaccurate" | "false", "confidence": 0.0-1.0, "explanation": "reason"}"""

    source_text = ""
    for i, source in enumerate(sources[:2], 1):
        source_text += f"Source {i}: {source.get('text', '')[:150]}\n"

    messages = [
        {"role": "user", "content": f"Claim: {claim}\n\nSources:\n{source_text}\n\nDoes the source support this claim?"}
    ]
    
    try:
        response = get_openrouter_response(messages, system_prompt)
        response = response.strip()
        
        start_idx = response.find('{')
        end_idx = response.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            return json.loads(response[start_idx:end_idx])
        return {"status": "verified" if sources else "false", "confidence": 0.5, "explanation": "Analysis incomplete"}
            
    except Exception as e:
        return {"status": "false", "confidence": 0.0, "explanation": str(e)}
