from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import RedirectResponse
from fastapi import Request as FastAPI_Request
import motor.motor_asyncio
from starlette.middleware.cors import CORSMiddleware
from bson import ObjectId
from typing import Annotated, Optional, List
from pydantic import BaseModel, BeforeValidator, Field, ConfigDict
from auth.user_creation import handle_id_token
from datetime import datetime, timedelta
from algorithm import *
from encryption import *
import requests
import json
import httpx

app = FastAPI()

client: motor.motor_asyncio.AsyncIOMotorClient = motor.motor_asyncio.AsyncIOMotorClient(
    "mongodb+srv://ngaudio0920:355875@user.au8gs.mongodb.net/?retryWrites=true&w=majority&appName=User"
)
db = client.get_database("Grouper")
groupCollection = db.get_collection("Groups")
userCollection = db.get_collection("Users")
inviteCollection = db.get_collection("Invites")
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
    email: str = Field(...)
    profile_picture: str = Field(...)
    access_token: str = Field(...)
    refresh_token: str = Field(...)

    class Config:
        json_encoders = {
            ObjectId: str
        }
        populate_by_name = True
        arbitrary_types_allowed = True

class UserList(BaseModel):
    users: List[UserModel]

# Schema Model for Groups
class GroupMember(BaseModel):
    id: str = Field(...)
    profile_picture: str = Field(...)
    username: str = Field(...)

class GroupModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    members: Optional[List[GroupMember]] = Field(default=[])

class GroupList(BaseModel):
    groups: List[GroupModel]

class InviteRequest(BaseModel):
    email: str
    group_name: str

class InviteModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    from_user: str = Field(...)
    to_user: str = Field(...)
    group_id: str = Field(...)

    class Config:
        json_encoders = {
            ObjectId: str
        }
        populate_by_name = True
        arbitrary_types_allowed = True

# Functions to List
# Get
@app.get("/users/", response_description="List of users", response_model=UserList,
    response_model_by_alias=False, )
async def list_users():
    users = await userCollection.find().to_list(1000)
    return UserList(users=users)

@app.get("/groups/", response_description="List of groups", response_model=GroupList, response_model_by_alias=False,)
async def list_groups():
    groups = await groupCollection.find().to_list(1000)
    
    formatted_groups = []
    for group in groups:
        group["_id"] = str(group["_id"])
        
        if isinstance(group.get("ids"), str):
            group["ids"] = group["ids"].split(",") if group["ids"] else []
        elif group.get("ids") is None:
            group["ids"] = []
            
        formatted_groups.append(group)
        
    return GroupList(groups=formatted_groups)

@app.get("/groups/{user_id}", response_description="List of user's groups", response_model=GroupList, response_model_by_alias=False)
async def list_user_groups(user_id: str):
    groups = await groupCollection.find({"members.id": user_id}).to_list(1000)

    formatted_groups = []
    for group in groups:
        group["_id"] = str(group["_id"])
        if not group.get("members"):
            group["members"] = []
            
        formatted_groups.append(group)

    return GroupList(groups=formatted_groups)

@app.get("/{group_id}/users", response_description="User json info in a group")
async def get_users_in_group(group_id: str):

    group_id = ObjectId(group_id)
    group = await groupCollection.find_one({"_id": group_id})
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if not group.get("members"):
        return {"message": "No users in this group"}
    
    return {"group_id": str(group_id), "users": group["members"]}

async def get_users_in_group_with_keys(group_id: str):
    # Find group by id
    group_id = ObjectId(group_id)
    group = await groupCollection.find_one({"_id": group_id})
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Get the members array from the group
    members = group.get("members", [])
    
    if not members:
        return {"message": "No users in this group"}
    
    # Extract user IDs from the members array
    user_ids = [member["id"] for member in members]
    
    # Fetch user details from the Users collection
    users = []
    async for user in userCollection.find({
        "_id": {"$in": [ObjectId(user_id) for user_id in user_ids]},
    }):
        if "access_token" in user and "refresh_token" in user:
            users.append(user)
    
    return users
@app.get("/user/{user_id}", response_description="Single user json info")
async def get_user(user_id: str):
    user_id_obj = ObjectId(user_id)

    user = await userCollection.find_one({"_id": user_id_obj})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["_id"] = str(user["_id"])

    user.pop("refresh_token", None)
    user.pop("access_token", None)

    return user
  
@app.get("/group/mergedcalendar/{group_id}", response_description="Returns JSON regarding the merged calendar")
async def get_merged_calendar(group_id: str):
    users = await get_users_in_group_with_keys(group_id)
    if isinstance(users, dict) and "message" in users:
        raise HTTPException(status_code=404, detail=users["message"])
    
    if not users:
        raise HTTPException(
            status_code=400, 
            detail="No users with valid access tokens found in this group"
        )
    return await algorithm_process_users(users)

# Functions to Create (users/groups)
# Post
@app.post("/user-add/", response_description="Add a new user", response_model=UserModel, 
          response_model_by_alias=False)
async def addUser(user: UserModel = Body(...)):
    new_user = await userCollection.insert_one(user.model_dump(by_alias=True, exclude={"id"}))
    created_user = await userCollection.find_one({"_id": new_user.inserted_id})

    created_user["_id"] = str(created_user["_id"])  # Convert ObjectId to string

    return created_user

@app.post("/group-add/", response_description="Add a new group", response_model=GroupModel, response_model_by_alias=False)
async def addGroup(group: GroupModel = Body(...)):
    new_group = await groupCollection.insert_one(group.model_dump(by_alias=True, exclude={"id"}))
    created_group = await groupCollection.find_one({"_id" : new_group.inserted_id})
    return created_group

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

# Endpoint that handles the redirect from Google
@app.get("/auth/callback", response_description="Callback")
async def auth_callback(request: FastAPI_Request):
    code = request.query_params.get("code")

    if not code:
        raise HTTPException(status_code=400, detail="Missing code parameter")

    # Exchange the authorization code for a token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "redirect_uri": "http://localhost:8000/auth/callback",
                "grant_type": "authorization_code",
            },
        )    

    # Response data with access_token, refresh_token, id_token
    response_data = response.json()

    # Retrieve private user info that is stored but not returned to the front end
    if "access_token" not in response_data or "refresh_token" not in response_data:
        raise HTTPException(status_code=500, detail="Failed to retrieve tokens from Google")
    
    # Retrieve public user info that can be returned back to the front end
    public_user_info = handle_id_token(response_data["id_token"])
    all_user_info = public_user_info

    all_user_info["access_token"] = encrypt(response_data["access_token"])
    all_user_info["refresh_token"] = encrypt(response_data["refresh_token"])

    model = UserModel(**all_user_info)

    if public_user_info:
        # first, check if the user is already in the database via email
        user = await userCollection.find_one({"email": public_user_info["email"]})

        if not user:
            user = await addUser(model)

            public_user_info["new_user"] = True
        else:
            await update_user((str(user.get("_id"))), model)
            public_user_info["new_user"] = False

    return RedirectResponse(url=f"https://localhost:3000/home?uid={str(user['_id'])}")

#Put
# Function to join group
@app.put("/group-join/", response_description="Join a new group", response_model=UserModel)
async def join_group(email: str, group_name: str):

    # Find user by email
    user = await userCollection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user is already in the group
    if group_name in user["groups"]:
        raise HTTPException(status_code=400, detail="User already part of the group")
    
    # Check if the group exists in the Groups collection
    group = await groupCollection.find_one({"name": group_name})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Add the new group to the user's groups and get rid of it in invited
    await userCollection.update_one(
        {"email": email},
        {
            "$push": {"groups": group_name},  # Add group to 'groups' list
            "$pull": {"invited": group_name}  # Remove group from 'invited' list
        }
    )

    # Add the user_id to the Groups DB
    await groupCollection.update_one(
        {"name": group_name},
        {"$push": {"ids": str(user["_id"])}}
    )

    # Get updated user document
    updated_user = await userCollection.find_one({"email": email})

    # Check if the updated_user is None
    if not updated_user:
        raise HTTPException(status_code=404, detail="Updated user not found")

    # Return the updated user by unpacking dictionary
    return UserModel(**updated_user)


# Function to invite to a group
@app.put("/group-invite", response_description="Invite user to a group")
async def invite_group(invite_data: InviteRequest):
    # Find user by email
    to_user = await userCollection.find_one({"email": invite_data.email})
    if not to_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find group by name
    group = await groupCollection.find_one({"name": invite_data.group_name})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is already in the group
    if any(member["id"] == str(to_user["_id"]) for member in group.get("members", [])):
        raise HTTPException(status_code=400, detail="User is already in this group")
    
    # Check if invite already exists
    existing_invite = await inviteCollection.find_one({
        "to_user": str(to_user["_id"]),
        "group_id": str(group["_id"])
    })
    
    if existing_invite:
        raise HTTPException(status_code=400, detail="User already invited")
    
    new_invite = {
        "from_user": group["members"][0]["id"] if group.get("members") else None,
        "to_user": str(to_user["_id"]),
        "group_id": str(group["_id"])
    }
    
    await inviteCollection.insert_one(new_invite)
    return {"message": "Invite sent successfully"}

@app.put("/update/{user_id}", response_description="Update user info")
async def update_user(user_id: str, user: UserModel):
    try:
        user_id_obj = ObjectId(user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    
    existing_user = await userCollection.find_one({"_id": user_id_obj})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_data = user.dict(exclude_unset=True, by_alias=True)

    result = await userCollection.update_one(
        {"_id": user_id_obj},
        {"$set": updated_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found or no change in data")
    
    updated_user = await userCollection.find_one({"_id": user_id_obj})
    
    updated_user["_id"] = str(updated_user["_id"])

    return updated_user

@app.get("/")
async def root():
    return {"Hello Grouper. I love Grouper..."}

def serialize_doc(doc):
    """Convert MongoDB document to serializable dictionary"""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

@app.delete("/groups/{group_id}")
async def delete_group(group_id: str):
        result = await groupCollection.delete_one({"_id": ObjectId(group_id)})
        if result.deleted_count == 1:
            return {"message": "Group deleted successfully"}
        raise HTTPException(status_code=404, detail="Group not found")

@app.get("/invites/{user_id}", response_description="Get user's invites")
async def get_user_invites(user_id: str):
        invites_cursor = inviteCollection.find({
            "to_user": user_id
        })
        
        invites = []
        async for invite in invites_cursor:
            group = await groupCollection.find_one({"_id": ObjectId(invite["group_id"])})
            if group:
                invite_data = {
                    "id": str(invite["_id"]),
                    "group_name": group["name"],
                    "group_id": str(group["_id"])
                }
                invites.append(invite_data)
        
        return {"invites": invites}

@app.put("/invites/{invite_id}/accept")
async def accept_invite(invite_id: str):

    invite = await inviteCollection.find_one({"_id": ObjectId(invite_id)})
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    to_user = await userCollection.find_one({"_id": ObjectId(invite["to_user"])})
    if not to_user:
        raise HTTPException(status_code=404, detail="User not found")

    await groupCollection.update_one(
        {"_id": ObjectId(invite["group_id"])},
        {"$addToSet": {"members": {
            "id": str(to_user["_id"]),
            "profile_picture": to_user["profile_picture"],
            "username": to_user["username"]
        }}}
    )

    await inviteCollection.delete_one({"_id": ObjectId(invite_id)})
    
    return {"message": "Invite accepted successfully"}

@app.put("/invites/{invite_id}/decline")
async def decline_invite(invite_id: str):
    result = await inviteCollection.delete_one({"_id": ObjectId(invite_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invite not found")
        
    return {"message": "Invite declined successfully"}

@app.put("/groups/{group_id}/leave")
async def leave_group(group_id: str, user_id: str):
    try:
        await groupCollection.update_one(
            {"_id": ObjectId(group_id)},
            {"$pull": {"members": {"id": user_id}}}
        )
        return {"message": "Successfully left group"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/groups/{group_id}/update")
async def update_group(group_id: str, group_data: dict):
    try:
        result = await groupCollection.update_one(
            {"_id": ObjectId(group_id)},
            {"$set": group_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Group not found")

        return {"message": "Group updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/users/{user_id}/update-username")
async def update_username(user_id: str, username: str):
    try:
        user_id_obj = ObjectId(user_id)
        
        existing_user = await userCollection.find_one({
            "_id": {"$ne": user_id_obj},
            "username": username
        })
        
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail="Username already taken"
            )
        
        result = await userCollection.update_one(
            {"_id": user_id_obj},
            {"$set": {"username": username}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        await groupCollection.update_many(
            {"members.id": str(user_id_obj)},
            {"$set": {"members.$.username": username}}
        )
        
        return {"message": "Username updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/users/{user_id}/update-profile-picture")
async def update_profile_picture(user_id: str, profile_picture: str):
    try:
        user_id_obj = ObjectId(user_id)
        
        result = await userCollection.update_one(
            {"_id": user_id_obj},
            {"$set": {"profile_picture": profile_picture}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        await groupCollection.update_many(
            {"members.id": str(user_id_obj)},
            {"$set": {"members.$.profile_picture": profile_picture}}
        )
        
        return {"message": "Profile picture updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/users/{email}/delete")
async def delete_user(email: str, admin_id: str):
    # Verify the requesting user is an admin
    admin = await userCollection.find_one({"_id": ObjectId(admin_id)})
    if not admin or admin.get("username") != "TEST":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        # Find user by email
        user = await userCollection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user_id = str(user["_id"])
        
        # Delete user from Users collection
        await userCollection.delete_one({"_id": user["_id"]})
        
        # Remove user from all groups they're in
        await groupCollection.update_many(
            {"members.id": user_id},
            {"$pull": {"members": {"id": user_id}}}
        )
        
        # Delete any invites for this user
        await inviteCollection.delete_many({
            "$or": [
                {"from_user": user_id},
                {"to_user": user_id}
            ]
        })
        
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))