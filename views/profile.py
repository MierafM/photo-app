from flask import Response, request
from flask_restful import Resource
from models import User
import json

def get_path():
    return request.host_url + 'api/posts/'

class ProfileDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
        # Your code here:
        data = User.query.filter_by(id=self.current_user.id).all()
        if not data:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        else:
            
            data = data[0].to_dict()
            return Response(json.dumps(data), mimetype="application/json", status=200)
        

def initialize_routes(api):
    api.add_resource(
        ProfileDetailEndpoint, 
        '/api/profile', 
        '/api/profile/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
