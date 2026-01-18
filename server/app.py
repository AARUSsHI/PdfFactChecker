"""PDF Fact Checker - Flask Backend Application."""
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Enable CORS for all origins
CORS(app, origins="*")

# Register blueprints
from routes.fact_check import fact_check_bp
app.register_blueprint(fact_check_bp)


@app.route('/')
def index():
    return {"message": "PDF Fact Checker API", "version": "1.0.0"}


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
