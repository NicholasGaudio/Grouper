from google.oauth2 import id_token
from google.auth.transport import requests
from env import CLIENT_ID

def verify_token(token):
  try:
      idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

      user_data = {
        "username": idinfo['name'],
        "groups": [],  # List any groups here
        "email": idinfo['email']
      }
      
      return user_data
  except ValueError:
      # Invalid token
      return {}
  