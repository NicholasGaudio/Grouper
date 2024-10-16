# 172.20.1.197
# uvicorn main:app --reload --host 172.20.1.197 --port 8000
from fastapi import FastAPI, Body, HTTPException
import motor.motor_asyncio
from starlette.middleware.cors import CORSMiddleware
from bson import ObjectId
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
    #Get list of all user info
    users = await userCollection.find().to_list(1000)
    return UserCollection(users=users)

@app.post("/user-add/", response_description="Add a new user", response_model=UserModel, 
          response_model_by_alias=False)
async def addUser(user: UserModel = Body(...)):
    #Create new user
    new_user = await userCollection.insert_one(user.model_dump(by_alias=True, exclude={"id"}))
    created_user = await userCollection.find_one({"_id": new_user.inserted_id})
    return created_user


@app.put("/group-join/", response_description="Join a new group", response_model=UserModel)
async def join_group(user_id: str, group_name: str):
    # Find the user by id
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    user_oid = ObjectId(user_id)  
    
    user = await userCollection.find_one({"_id": user_oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user is already part of the group
    if group_name in user["groups"]:
        raise HTTPException(status_code=400, detail="User already part of the group")

    # Add the new group to the user's list of groups
    await userCollection.update_one(
        {"_id": user_oid},
        {"$push": {"groups": group_name}}
    )

    # Fetch the updated user document
    updated_user = await userCollection.find_one({"_id": user_oid})

    return UserModel(**updated_user)




@app.get("/")
async def root():
    return {"Hello Grouper"}

