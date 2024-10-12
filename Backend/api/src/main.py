# 172.20.1.197
# uvicorn main:app --reload --host 172.20.1.197 --port 8000
from fastapi import FastAPI
import motor.motor_asyncio
from starlette.middleware.cors import CORSMiddleware
from typing import Annotated, Optional, List
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict


app = FastAPI()

client: motor.motor_asyncio.AsyncIOMotorClient = motor.motor_asyncio.AsyncIOMotorClient(
    "mongodb+srv://ngaudio0920:355875@user.au8gs.mongodb.net/?retryWrites=true&w=majority&appName=User"
)
db = client.get_database("Grouper")
userCollection = db.get_collection("Users")
PyObjectId = Annotated[str, BeforeValidator(str)]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    username: str = Field(...)
    groups: list = Field(...)
    password: str = Field(...)
    token: str = Field(...)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )


class UserCollection(BaseModel):
    users: List[UserModel]


@app.get("/users/", response_description="List of users", response_model=UserCollection,
    response_model_by_alias=False, )
async def list_users():
    users = await userCollection.find().to_list(1000)
    return UserCollection(users=users)


@app.get("/")
async def root():
    return {"Hello Grouper"}

