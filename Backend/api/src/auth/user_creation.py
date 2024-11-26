from google.oauth2 import id_token
from google.auth.transport import requests
from env import CLIENT_ID

<<<<<<< HEAD
def handle_id_token(token):
  try:
      idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
      print(idinfo)
      user_data = {
        "username": idinfo['name'],
        "email": idinfo['email'],
        "profile_picture": idinfo['picture'],  # List any groups here
=======
def verify_token(token):
  try:
      idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

      user_data = {
        "username": idinfo['name'],
        "groups": [],  # List any groups here
        "invited": [],
        "email": idinfo['email']
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
      }
      
      return user_data
  except ValueError:
      # Invalid token
<<<<<<< HEAD
      return {}
=======
      return {}
  
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
