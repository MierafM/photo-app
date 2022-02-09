from flask import Response, request
from flask_restful import Resource
from models import Following
import json

def get_path():
    return request.host_url + 'api/posts/'

class FollowerListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        data = Following.query.filter(Following.following_id==self.current_user.id).all()
        if not data:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        else:
            data = [
                item.to_dict_follower() for item in data 
            ]
            return Response(json.dumps(data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowerListEndpoint, 
        '/api/followers', 
        '/api/followers/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
