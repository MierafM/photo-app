from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json
from . import can_view_post, get_authorized_user_ids
import flask_jwt_extended
from flask_jwt_extended import jwt_required
def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    @jwt_required()
    def get(self):
        # Your code here
        data = Following.query.filter(Following.user_id==self.current_user.id).all()
        if not data:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        else:
            data = [
                item.to_dict_following() for item in data 
            ]
            return Response(json.dumps(data), mimetype="application/json", status=200)
    @jwt_required()
    def post(self):
        body = request.get_json()

        if body == None:
            return Response(json.dumps({'message': 'post_id required to post'}), mimetype="application/json", status=400)
        user_id = body.get('user_id')
       
        if not user_id or type(user_id) != int :
           
            return Response(json.dumps({'message': 'valid user id required to post'}), mimetype="application/json", status=400)
        #no duplicate works
        if user_id in get_authorized_user_ids(self.current_user):
            response_obj = {
                'message': 'You already follow this user={0}'.format(user_id)
            }
            
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        

        try: 
            following = Following(self.current_user.id, user_id)
            db.session.add(following)
            db.session.commit()
        except Exception:
            return Response(json.dumps({'message': 'not a valid user'}), mimetype="application/json", status=404)
        return Response(json.dumps(following.to_dict_following()), mimetype="application/json", status=201)
        


class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    @jwt_required()
    def delete(self, id):
       
        if id.isnumeric() != True:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        following = Following.query.get(id)
        # print('given id', id, "current user", self.current_user.id)
        # print("following whole: ", following, "values (id, user_id, following_id, follower, following_id): ", following.id, following.user_id, following.following_id, following.follower, following.following)
        if not following:
            
            return Response(json.dumps({'message': 'Follower does not exist'}), mimetype="application/json", status=404)
       
        Following.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Following {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)

        


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
