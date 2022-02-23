// stories////////////////////////////////////////
const story2Html = story => {
    return `
        <section class='story'>
            <img class='storyimg' src="${ story.user.thumb_url }"  alt="profile pic for ${ story.user.username }" />
            <span class='storyName'>${ story.user.username }</span>
        </section>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('#storiesPanel').innerHTML = html;
        })
};

// posts /////////////////////////////////////////////
const post2HTML = post => {
    // console.log('post:', post)
    return `
    <section class='card'> 
                    
        <section class='cardHeader'>
            <h2 class='cardName'>${ post.user.username }</h2>
            <i class="fas fa-ellipsis-h"></i>
        </section>

        <img id='cardImg' src="${ post.image_url }" alt="image posted by ${ post.user.username }">
        
        <section class='cardbody'>
            <section class='interactionLinks'>
                <section class='mainIcons'>
                    <button class="${ post.current_user_like_id ? 'unlikeBtn' : 'likeBtn' } iconBtn" data-LikedPost-id="${post.id}" onclick="likeUnlike(event)">
                        <i class="fa${ post.current_user_like_id ? 's' : 'r' } fa-heart"></i>
                    </button>
                    <button class="iconBtn">
                        <i class="far fa-comment"></i>
                    </button>
                    <button class="iconBtn">
                        <i class="far fa-paper-plane"></i>
                    </button>
                    
                    
                </section>
                <button class="${ post.current_user_bookmark_id ? 'marked' : 'unmarked' } iconBtn" data-postid="${post.id}" onclick="toggleBookmark(event)" >
                    <i class="fa${ post.current_user_bookmark_id ? 's' : 'r' } fa-bookmark"></i>
                </button>
            </section>
            <section class='likeSec${post.id}'>
                <span class='likeText'><b>${ post.likes.length } like${post.likes.length != 1 ? 's' : ''}</b></span>
            </section>
            <section class='caption'>
                <span class='createrName'>${ post.user.username }</span>
                <span class="picCaption"> ${ post.caption }</span>
                <button class='moreBtn'>more</button>
            </section>
            <section id="commentsOf${post.id}" class='commentsSec'>
                ${ displayComments(post.comments, post.id) }
            </section>
            <section class='commentDate'>
                    <span class='commentDateText'> ${post.display_time}</span>
                </section>
            
        </section>
        <section class='userComment'>
            <section class="postCommentSec">

                <i class="far fa-smile"></i>
                
                <input class='commentInput' id="commentFor${post.id}" aria-label="comment input" type="text" placeholder="Add a comment...">
            </section>
            <button class='postBtn' onClick="addComment(${post.id})">Post</button>
        </section>

    </section>
    
    `
}
const displayComments = (comments, postID) =>{
    // console.log(comments)
    let html = ''
    //for the view x comments
    if (comments.length > 1){
        html += `
            <button class='commentsLen' data-post-id="${postID}" onclick="showPostDetail(event)" >view all ${comments.length} comments</button>
        `
    }
    //for displaying last comment from list
    if (comments && comments.length > 0){
        const lastComment = comments[comments.length -1]
        html += `
        <section class='comment'>
            <span class='commenterName'>${lastComment.user.username}</span>
            <span class='commentText'>${lastComment.text}</span>
        </section>
        
        `
    }
    return html
}
const addComment = (postId) =>{

    input = document.querySelector('#commentFor'+postId).value
    
    const postData = {
        "post_id": postId,
        "text": input
    };
    fetch("/api/comments", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        }).then(response => response.json()).then(data => {
            console.log("data",data);
        });
    console.log('added comment', input)
    fetch("/api/posts/"+postId).then(res => res.json()).then(post =>{
        console.log('fetched', post)
        // console.log('changing', document.querySelector('.likeSec'+post.id))
        document.querySelector("#commentsOf"+postId).innerHTML = displayComments(post.comments, postId)
    })
    document.querySelector('#commentFor'+postId).value = ""
    
}

const showPostDetail = ev =>{
    const postId = ev.currentTarget.dataset.postId
    console.log('showing modal')
    
    fetch("/api/posts/"+postId).then(res => res.json()).then(post =>{
        console.log('fetched', post)
        const html = `
                <section class="modalInside">
                    <button class="modalBtn" onclick="destroyModal(event)">
                        <i>X</i>
                    </button>
                    <section class="modalContent">
                        <img class="modalImg" src="${post.image_url}" />
                        <section class="modalText">
                            <section class="userSec">
                                
                            </section>
                            <section class="mCommentSec">
                               
                            <section>
                        </section>
                    </section>
                </section>
        `
        document.querySelector('.modalContainer').innerHTML = html;
        displayModalUser()
        displayModalComments(post)
        console.log('added things to modal')
        

    })
    document.querySelector('.modalContainer').id = ("showingModel")
   
   
    document.querySelector('body').style.overflow = "hidden"
    console.log(document.querySelector('#following').style.overflow)
}
const destroyModal = ev =>{
    document.querySelector(".modalContainer").innerHTML = ''
    document.querySelector('.modalContainer').id = ("")
    document.querySelector('body').style.overflow = "auto"

}

const displayModalUser = () => {
    fetch("/api/profile/", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json()).then(currUser => {
        // console.log(currUser);
        let html = `
        <img class='modalUserImg' src="${ currUser.thumb_url }"  alt="profile pic for ${ currUser.username }" />
        <span class="modalUserName"> ${currUser.username}</span>
        `
        
        document.querySelector('.userSec').innerHTML = html
    })

}
const displayModalComments = (post) =>{
    console.log("post: ",post)
    const html = post.comments.map(comments2Html).join('\n');
    console.log(document.querySelector('.mCommentSec'))
    document.querySelector(".mCommentSec").innerHTML = html



}
const comments2Html = (comment) => {
    return `
        <section class="modalCommentWrap">
            <img id='modalCommenterImg' src="${ comment.user.thumb_url }" alt="image posted by ${ comment.user.username }">
            <section class='modalComment'>
                <span class="modalCommenterName"><strong>${comment.user.username}</strong></span>
                <span class="modalCommentText">${comment.text}</span><br>
                <span class="modalCommentDate"><strong>${comment.display_time}</strong></span>
            </section>
            <i class="fa${ comment.post_id.current_user_like_id ? 's' : 'r' } fa-heart"></i>
        </section>
    
    `

}
const displayPosts = () =>{
    fetch('/api/posts').then(res => res.json()).then(posts =>{
        // console.log('displaying posts');
        const html = posts.map(post2HTML).join('\n');
        document.querySelector('#posts').innerHTML = html
        
    })
}

///display aside

const displayRecs = () =>{
    fetch('/api/suggestions').then(res => res.json()).then(suggestions => {
        console.log("suggestions fetched", suggestions)
        const html = suggestions.map(sugg2Html).join('\n')
        document.querySelector("#suggestedUsers").innerHTML = html
    })
}

const sugg2Html = suggestion => {
    // console.log('suggestion:', suggestion)
    return `
    <section class=suggestedProfile>
        <img class='suggestedProfilePic' src="${suggestion.thumb_url}" alt="${suggestion.username}'s profile picture">
        <section class=suggestionText>
            <span class='suggestedName'>${suggestion.username}</span>
            <span class='sFU'>suggested for you</span>
        </section>
        <button class='followBtn' aria-label="Follow" aria-checked="false" data-user-id="${suggestion.id}"onClick="toggleFollow(event)">Follow</button>
    </section>  
    `

}
const toggleFollow = ev =>{
    const elem = ev.currentTarget
    if (elem.innerHTML === 'Follow'){
        // console.log('fetching ', elem.dataset.userId)
        addFollower(elem.dataset.userId, ev.currentTarget)
        

    }
    else{
        // console.log('attempting to call delete', elem.dataset)
        deleteFollower(elem.dataset.followingid, ev.currentTarget)
       

    }
}
const addFollower = (userId, elem) =>{
    // console.log("id",userId)
    const postData = {
        "user_id": Number(userId)
    }

    fetch("http://localhost:5000/api/following/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'Unfollow'
            elem.setAttribute('aria-checked',"true")
            elem.classList.add('unfollowBtn')
            elem.classList.remove('followBtn')
            elem.setAttribute('data-followingid', data.following.id)
           
        })

}
const deleteFollower = (followerId, elem) =>{
    // console.log('trying to unfollow', followerId)
    fetch("http://localhost:5000/api/following/"+followerId, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.innerHTML = 'Follow'
        elem.setAttribute('aria-checked',"false")
        elem.classList.add('followBtn')
        elem.classList.remove('unfollowBtn')
        elem.removeAttribute('data-followingid')
    });

}
//////////
const displayUser  = () =>{
    fetch("/api/profile/", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(currUser => {
        // console.log(currUser);
        const html = user2Html(currUser)
        document.querySelector('#userSection').innerHTML = html
    });
}
const user2Html = user =>{
    // console.log("curr user", user)
    return `
        <img id='userImg' src="${user.thumb_url}" alt="${user.username}'s profile picture">
        <h2 id='userNameRec'>${user.username}</h2>
    `
}

const likeUnlike = ev =>{
    elem = ev.currentTarget
    console.log('like/unlike clicked', elem.getAttribute("class"))
    const post = elem.dataset.likedpostId
    const user = elem.dataset.currUser


    if (elem.getAttribute("class").includes("unlikeBtn")){
        console.log(post, "img UNliked, sending post reqest")
        fetch("/api/profile/", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(currUser => {
            // console.log("got user: ",currUser, post);
            fetch("/api/posts/"+post+"/likes/"+currUser.id, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
            
            })
            .then(response => response.json())
            .then(data => {
                console.log('unliked post', data)
                elem.classList.add('likeBtn')
                elem.classList.remove('unlikeBtn')
                elem.innerHTML = `<i class="far fa-heart"></i>`
                
                updateLikes(post)
            })
            
        });
        
        

    }else if (elem.getAttribute("class").includes("likeBtn")){
        console.log(post, "img liked, sending post reqest")
        fetch("/api/posts/"+post+"/likes/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        
        })
        .then(response => response.json())
        .then(data => {
            console.log("liked post", data);
            elem.classList.add('unlikeBtn')
            elem.classList.remove('likeBtn')
            elem.innerHTML = `<i class="fas fa-heart"></i>`
            console.log(document.querySelector(".fa-heart").style)
            
            updateLikes(data.post_id)
            //update posts
            // displayPosts()

        });
    }
    
    
}
const updateLikes = (post) =>{
    // console.log('updating ', post, '\'s likes')
    fetch("/api/posts/"+post).then(res => res.json()).then(post =>{
        // console.log('fetched', post)
        // console.log('changing', document.querySelector('.likeSec'+post.id))
        document.querySelector('.likeSec'+post.id).innerHTML = `<span class='likeText'><b>${ post.likes.length } like${post.likes.length != 1 ? 's' : ''}</b></span>`
        
    })
}
/////////update bookmarks
const toggleBookmark = (ev) =>{
    const elem = ev.currentTarget
    // console.log(elem,elem.getAttribute("class") )
    if (elem.getAttribute("class").includes("unmarked")){
        console.log('adding bookmark')
        const postData = {
            "post_id": elem.dataset.postid
        };
        
        fetch("/api/bookmarks/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        }).then(response => response.json()).then(data => {
            console.log(data);
            elem.classList.add('marked')
            elem.classList.remove('unmarked')
            console.log(elem.innerHTML)
            elem.innerHTML = `<i class="fas fa-bookmark"></i>`
            console.log(elem.innerHTML)

        });

    }else if (elem.getAttribute("class").includes("marked")){
        console.log('removing bookmark')
        fetch("/api/bookmarks/"+elem.dataset.postid, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
        }).then(response => response.json()).then(data => {
            console.log(data);
            elem.classList.add('unmarked')
            elem.classList.remove('marked')
            console.log(elem.innerHTML)
            elem.innerHTML = `<i class="far fa-bookmark"></i>`
            console.log("removed bookmark", elem.innerHTML)


        });
    }
}

const initPage = () => {
    displayStories();
    displayPosts();
    displayRecs()
    displayUser()
};
// invoke init page to display stories:
initPage();