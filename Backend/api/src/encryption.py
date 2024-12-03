from cryptography.fernet import Fernet
from env import ENCRYPTION_KEY



def encrypt(token: str) -> str:
    cipher = Fernet(ENCRYPTION_KEY.encode())
    encrypted_token = cipher.encrypt(token.encode())
    return str(encrypted_token.decode())

def decrypt(encrypted_token: str) -> str:
    cipher = Fernet(ENCRYPTION_KEY.encode())
    decrypted_token = cipher.decrypt(encrypted_token.encode())
    return str(decrypted_token.decode())