from flask import Response
from flask_restful import Resource
from models import LikePost, db
import json
from . import can_view_post
import flask_jwt_extended
from flask_jwt_extended import jwt_required
class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    @jwt_required()
    def post(self, post_id):
        # Your code here
        if not post_id or post_id.isnumeric() != True:
            
            return Response(json.dumps({'message': 'valid post_id required to like a post'}), mimetype="application/json", status=400)
        if can_view_post(post_id, self.current_user)== False:
            
            response_obj = {
                'message': 'You don\'t have access to post_id={0}'.format(post_id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        #save to db
        try: 
            post_like = LikePost(self.current_user.id, post_id)
            db.session.add(post_like)
            db.session.commit()
        except Exception:
            return Response(json.dumps({'message': 'already been liked'}), mimetype="application/json", status=400)    
        return Response(json.dumps(post_like.to_dict()), mimetype="application/json", status=201)
        

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    @jwt_required()
    def delete(self, post_id, id):
        # Your code here
        print('given (postid, id)', post_id, id)
        if id.isnumeric() != True or post_id.isnumeric() != True:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        likepost = LikePost.query.filter_by(post_id=post_id, user_id=id)
        print(likepost)
        if not likepost or can_view_post(post_id, self.current_user)== False:
            # print('likepost:', likepost, ' curr user', self.current_user.id, ' likepost (id, user_id, post_id):', likepost.id, likepost.user_id, likepost.post_id)
            return Response(json.dumps({'message': 'like post does not exist'}), mimetype="application/json", status=404)
       
        
        db.session.commit()
        
        if can_view_post(post_id, self.current_user):
            LikePost.query.filter_by(post_id=post_id, user_id=id).delete()
            db.session.commit()
            serialized_data = {
            'message': 'Like Post {0} successfully deleted.'.format(post_id)
            }
            return Response(json.dumps(serialized_data), mimetype="application/json", status=200)
        else:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)





def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
