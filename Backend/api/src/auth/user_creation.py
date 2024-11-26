from google.oauth2 import id_token
from google.auth.transport import requests
from env import CLIENT_ID

def handle_id_token(token):
  try:
      idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
      print(idinfo)
      user_data = {
        "username": idinfo['name'],
        "email": idinfo['email'],
        "profile_picture": idinfo['picture'],  # List any groups here
      }
      
      return user_data
  except ValueError:
      # Invalid token
      return {}
