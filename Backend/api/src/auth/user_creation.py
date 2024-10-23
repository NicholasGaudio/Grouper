from google.oauth2 import id_token
from google.auth.transport import requests

def verify_token(token):
  try:
      # Specify the CLIENT_ID of the app that accesses the backend:
      idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

      # Or, if multiple clients access the backend server:
      # idinfo = id_token.verify_oauth2_token(token, requests.Request())
      # if idinfo['aud'] not in [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]:
      #     raise ValueError('Could not verify audience.')

      # If the request specified a Google Workspace domain
      # if idinfo['hd'] != DOMAIN_NAME:
      #     raise ValueError('Wrong domain name.')

      #  ID token is valid. Get the user's Google Account ID from the decoded token.
      userid = idinfo['sub']
  except ValueError:
      # Invalid token
      pass
  
def add_user(data):
   # post info with email to the database
   # add me later
   return True