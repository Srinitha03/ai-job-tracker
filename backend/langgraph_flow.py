# ===== IMPORTS =====
from langgraph.graph import StateGraph
from typing import TypedDict

# ===== STATE =====
class GraphState(TypedDict):
    query: str
    intent: str
    response: str

# ===== GRAPH =====
graph = StateGraph(GraphState)

# ===== NODE 1: INTENT DETECTION =====
def detect_intent(state: GraphState):
    query = state["query"].lower()

    if "remote" in query:
        intent = "remote"
    elif "hybrid" in query:
        intent = "hybrid"
    elif "onsite" in query:
        intent = "onsite"
    elif "match" in query:
        intent = "high_match"
    else:
        intent = "general"

    return {**state, "intent": intent}

# ===== NODE 2: RESPONSE =====
def generate_response(state: GraphState):
    intent = state["intent"]

    if intent == "remote":
        response = "Showing remote jobs"
    elif intent == "hybrid":
        response = "Showing hybrid jobs"
    elif intent == "onsite":
        response = "Showing onsite jobs"
    elif intent == "high_match":
        response = "Showing high match jobs"
    else:
        response = "How can I help you?"

    return {**state, "response": response}

# ===== CONNECT GRAPH =====
graph.add_node("intent", detect_intent)
graph.add_node("response", generate_response)

graph.set_entry_point("intent")
graph.add_edge("intent", "response")

# ===== COMPILE =====
app = graph.compile()
import json
import sys
import re

def detect_intent(query):
    """
    Detect job mode and type intent from user query
    Returns: 'remote', 'hybrid', 'onsite', 'full-time', 'part-time', 'contract', 'internship', or 'all'
    """
    query_lower = query.lower()
    
    # Check for work modes
    if 'hybrid' in query_lower:
        return 'hybrid'
    elif 'remote' in query_lower or 'work from home' in query_lower or 'wfh' in query_lower:
        return 'remote'
    elif 'onsite' in query_lower or 'on-site' in query_lower or 'office' in query_lower:
        return 'onsite'
    
    # Check for job types
    elif 'full time' in query_lower or 'fulltime' in query_lower:
        return 'full-time'
    elif 'part time' in query_lower or 'parttime' in query_lower:
        return 'part-time'
    elif 'contract' in query_lower:
        return 'contract'
    elif 'intern' in query_lower or 'internship' in query_lower:
        return 'internship'
    
    # Check for location queries
    elif 'usa' in query_lower or 'us' in query_lower:
        return 'usa'
    elif 'india' in query_lower:
        return 'india'
    elif 'uk' in query_lower or 'united kingdom' in query_lower:
        return 'uk'
    elif 'sweden' in query_lower:
        return 'sweden'
    
    # Default
    else:
        return 'all'

def generate_response(intent, query):
    """
    Generate appropriate response based on intent
    """
    responses = {
        'remote': "🏠 Showing remote jobs that allow working from anywhere",
        'hybrid': "🔄 Showing hybrid jobs that combine office and remote work",
        'onsite': "🏢 Showing on-site jobs that require working from office",
        'full-time': "💼 Showing full-time positions with benefits",
        'part-time': "⏰ Showing part-time positions for flexible schedules",
        'contract': "📝 Showing contract positions for project-based work",
        'internship': "🎓 Showing internship opportunities for students and freshers",
        'usa': "🇺🇸 Showing jobs in United States",
        'india': "🇮🇳 Showing jobs in India",
        'uk': "🇬🇧 Showing jobs in United Kingdom",
        'sweden': "🇸🇪 Showing jobs in Sweden",
        'all': f"📋 Showing all available jobs matching '{query}'"
    }
    return responses.get(intent, "Here are the jobs I found")

def main():
    # Get query from command line argument
    query = sys.argv[1] if len(sys.argv) > 1 else ""
    
    # Detect intent
    intent = detect_intent(query)
    
    # Generate response
    response = generate_response(intent, query)
    
    # Create JSON output
    result = {
        "query": query,
        "intent": intent,
        "response": response
    }
    
    # Print JSON (this will be captured by Node.js)
    print(json.dumps(result))
    
    # Also print to stderr for debugging (won't affect JSON output)
    print(f"DEBUG: Query='{query}', Intent='{intent}'", file=sys.stderr)

if __name__ == "__main__":
    main()