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
groupCollection = db.get_collection("Groups")
userCollection = db.get_collection("Users")
PyObjectId = Annotated[str, BeforeValidator(str)]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schema Model for User
class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    username: str = Field(...)
    groups: list = Field(...)
    email: str = Field(...)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class UserList(BaseModel):
    users: List[UserModel]

# Schema Model for Groups
class GroupModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    ids: list = Field(...)

class GroupList(BaseModel):
    groups: List[GroupModel]


# Functions to List
@app.get("/users/", response_description="List of users", response_model=UserList,
    response_model_by_alias=False, )
async def list_users():
    users = await userCollection.find().to_list(1000)
    return UserList(users=users)

@app.get("/groups/", response_description="List of groups", response_model=GroupList, response_model_by_alias=False,)
async def liset_groups():
    groups = await groupCollection.find().to_list(1000)
    return GroupList(groups=groups)


# Functions to Create (users/groups)
@app.post("/user-add/", response_description="Add a new user", response_model=UserModel, 
          response_model_by_alias=False)
async def addUser(user: UserModel = Body(...)):
    new_user = await userCollection.insert_one(user.model_dump(by_alias=True, exclude={"id"}))
    created_user = await userCollection.find_one({"_id": new_user.inserted_id})
    return created_user

@app.post("/group-add/", response_description="Add a new group", response_model=GroupModel, response_model_by_alias=False)
async def addGroup(group: GroupModel = Body(...)):
    new_group = await groupCollection.insert_one(group.model_dump(by_alias=True, exclude={"id"}))
    created_group = await groupCollection.find_one({"_id" : new_group.inserted_id})
    return created_group


# Function to join group
@app.put("/group-join/", response_description="Join a new group", response_model=UserModel)
async def join_group(user_id: str, group_name: str):
    # Validate if user_id is valid ObjectId
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    user_oid = ObjectId(user_id)
    
    # Find user by id
    user = await userCollection.find_one({"_id": user_oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user is already in the group
    if group_name in user["groups"]:
        raise HTTPException(status_code=400, detail="User already part of the group")
    
    # Check if the group exists in the Groups collection
    group = await groupCollection.find_one({"name": group_name})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Add the new group to the user's groups
    await userCollection.update_one(
        {"_id": user_oid},
        {"$push": {"groups": group_name}}  
    )

    # Add the user_id to the Groups DB
    await groupCollection.update_one(
        {"name": group_name},
        {"$push": {"ids": user_id}}
    )

    # Get updated user document
    updated_user = await userCollection.find_one({"_id": user_oid})

    # Check if the updated_user is None
    if not updated_user:
        raise HTTPException(status_code=404, detail="Updated user not found")

    # Return the updated user by unpacking dictionary
    return UserModel(**updated_user)


@app.get("/")
async def root():
    return {"Hello Grouper"}

