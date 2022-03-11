const getCookie = key => {
    let name = key + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};



// stories////////////////////////////////////////
const story2Html = story => {
    return `
        <section class='story'>
            <img class='storyimg' src="${ story.user.thumb_url }"  alt="profile pic for ${ story.user.username }" />
            <span class='storyName'>${ story.user.username }</span>
        </section>
    `;
};

// fetch data from your API endpoint: //get
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
                    <button class="${ post.current_user_like_id ? 'unlikeBtn' : 'likeBtn' } iconBtn" data-LikedPost-id="${post.id}" onclick="likeUnlike(event)" aria-label="Like" aria-checked="${ post.current_user_like_id ? 'true' : 'false' }">
                        <i class="fa${ post.current_user_like_id ? 's' : 'r' } fa-heart"></i>
                    </button>
                    <button class="iconBtn">
                        <i class="far fa-comment"></i>
                    </button>
                    <button class="iconBtn">
                        <i class="far fa-paper-plane"></i>
                    </button>
                    
                    
                </section>
                <button class="${ post.current_user_bookmark_id ? 'marked' : 'unmarked' } iconBtn" data-postid="${post.id}" data-bookmarkid=${post.current_user_bookmark_id} onclick="toggleBookmark(event)" aria-label="Bookmark" aria-checked="${ post.current_user_bookmark_id ? 'true' : 'false' }">
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
            <section class='commentDate'>
                    <span class='commentDateText'> ${post.display_time}</span>
            </section>
            <section id="commentsOf${post.id}" class='commentsSec'>
                ${ displayComments(post.comments, post.id) }
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
            <span class='commentText'>${lastComment.text}</span><br>
            <span class='commentDateText'> ${lastComment.display_time}</span>
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
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        }).then(response => response.json()).then(data => {
            console.log(data);
        });
    
    fetch("/api/posts/"+postId, {
        method: "GET",
        headers: {
            
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    }).then(res => res.json()).then(post =>{
        console.log(post)
        document.querySelector("#commentsOf"+postId).innerHTML = displayComments(post.comments, postId)
    })
    document.querySelector('#commentFor'+postId).value = ""
    
}

const showPostDetail = ev =>{
    const postId = ev.currentTarget.dataset.postId
    
    
    fetch("/api/posts/"+postId , {
        method: "GET",
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token')   
        }
    }).then(res => res.json()).then(post =>{
        console.log(post)
        const html = `
                <section class="modalInside">
                    <button class="modalBtn" id="modalBtn" tabindex="-1" onclick="destroyModal(event)">
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

        displayModalUser(postId)
        displayModalComments(post)
        
        

    }).then( () => 
        focusElem(document.getElementById('modalBtn')) 
    )

    document.querySelector('.modalContainer').id = ("showingModel")
    document.querySelector('body').style.overflow = "hidden"
    
}
const focusElem = (elem) =>{
   
    elem.focus();

}

const destroyModal = ev =>{
    document.querySelector(".modalContainer").innerHTML = ''
    document.querySelector('.modalContainer').id = ("")
    document.querySelector('body').style.overflow = "auto"
    focusElem(document.querySelector('.commentsLen'))
    

}

const displayModalUser = (id) => {
    fetch("/api/posts/"+id, {
        method: "GET",
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token')   
        }
    }).then(response => response.json()).then(post => {
        console.log(post);
        let html = `
        <img class='modalUserImg' src="${ post.user.thumb_url }"  alt="profile pic for ${ post.user.username }" />
        <span class="modalUserName"> ${post.user.username}</span>
        `
        
        document.querySelector('.userSec').innerHTML = html
        let html2 = `
        <section class="modalCommentWrap">
            <img id='modalCommenterImg' src="${ post.user.thumb_url }" alt="image posted by ${ post.user.username }">
            <section class='modalComment'>
                <span class="modalCommenterName"><strong>${post.user.username}</strong></span>
                <span class="modalCommentText">${post.caption}</span><br>
                <span class="modalCommentDate"><strong>${post.display_time}</strong></span>
            </section>
            <i class="fa${ post.id.current_user_like_id ? 's' : 'r' } fa-heart"></i>
        </section>`
        document.querySelector(".mCommentSec").insertAdjacentHTML('afterbegin', html2)

    })

}
const displayModalComments = (post) =>{
    const html = post.comments.map(comments2Html).join('\n');
    document.querySelector(".mCommentSec").innerHTML += html



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
    // console.log('cookie:', getCookie('csrf_access_token'))
    fetch('/api/posts', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')  
        }
    }).then(res => res.json()).then(posts =>{

        const html = posts.map(post2HTML).join('\n');
        document.querySelector('#posts').innerHTML = html
        
    })
}

///display aside

const displayRecs = () =>{
    fetch('/api/suggestions', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    }).then(res => res.json()).then(suggestions => {
        console.log( suggestions)
        const html = suggestions.map(sugg2Html).join('\n')
        document.querySelector("#suggestedUsers").innerHTML = html
    })
}

const sugg2Html = suggestion => {
    return `
    <section class=suggestedProfile>
        <section class='leftSug'>
            <img class='suggestedProfilePic' src="${suggestion.thumb_url}" alt="${suggestion.username}'s profile picture">
            <section class=suggestionText>
                <span class='suggestedName'>${suggestion.username}</span>
                <span class='sFU'>suggested for you</span>
            </section>
        </section>
        <button class='followBtn' aria-label="Follow" aria-checked="false" data-user-id="${suggestion.id}"onClick="toggleFollow(event)">Follow</button>
    </section>  
    `

}
const toggleFollow = ev =>{
    const elem = ev.currentTarget
    if (elem.innerHTML === 'Follow'){
        
        addFollower(elem.dataset.userId, ev.currentTarget)
        

    }
    else{
        
        deleteFollower(elem.dataset.followingid, ev.currentTarget)
       

    }
}
const addFollower = (userId, elem) =>{
   
    const postData = {
        "user_id": Number(userId)
    }

    fetch("http://localhost:5000/api/following/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
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
    console.log('followeer id', followerId)
    fetch("http://localhost:5000/api/following/"+followerId, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
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
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(currUser => {
        //console.log(currUser);
        const html = user2Html(currUser)
        document.querySelector('#userSection').innerHTML = html
    });
}
const user2Html = user =>{
    
    return `
        <img id='userImg' src="${user.thumb_url}" alt="${user.username}'s profile picture">
        <h2 id='userNameRec'>${user.username}</h2>
    `
}

const likeUnlike = ev =>{
    elem = ev.currentTarget
    const post = elem.dataset.likedpostId
    const user = elem.dataset.currUser


    if (elem.getAttribute("class").includes("unlikeBtn")){
        
        fetch("/api/profile/", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            }
        })
        .then(response => response.json())
        .then(currUser => {
            
            fetch("/api/posts/"+post+"/likes/"+currUser.id, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCookie('csrf_access_token')
                },
            
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                elem.classList.add('likeBtn')
                elem.classList.remove('unlikeBtn')
                elem.innerHTML = `<i class="far fa-heart"></i>`
                elem.setAttribute('aria-checked',"false")
                
                updateLikes(post)
            })
            
        });
        
        

    }else if (elem.getAttribute("class").includes("likeBtn")){
        fetch("/api/posts/"+post+"/likes/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
        
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.classList.add('unlikeBtn')
            elem.classList.remove('likeBtn')
            elem.innerHTML = `<i class="fas fa-heart"></i>`
            elem.setAttribute('aria-checked',"true")
            updateLikes(data.post_id)
           

        });
    }
    
    
}
const updateLikes = (post) =>{
    
    fetch("/api/posts/"+post, {
        method: "GET",
        headers: {
            
            'X-CSRF-TOKEN': getCookie('csrf_access_token')  
        }
    }).then(res => res.json()).then(post =>{
        console.log(post)
        document.querySelector('.likeSec'+post.id).innerHTML = `<span class='likeText'><b>${ post.likes.length } like${post.likes.length != 1 ? 's' : ''}</b></span>`
        
    })
}
/////////update bookmarks
const toggleBookmark = (ev) =>{
    const elem = ev.currentTarget
    console.log(elem.dataset)
    
    if (elem.getAttribute("class").includes("unmarked")){
        
        const postData = {
            "post_id": elem.dataset.postid
        };
        console.log("sending", JSON.stringify(postData))
        fetch("/api/bookmarks/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')  
            },
            body: JSON.stringify(postData)
        }).then(response => response.json()).then(data => {
            console.log(data);
            elem.classList.add('marked')
            elem.classList.remove('unmarked')
            
            elem.innerHTML = `<i class="fas fa-bookmark"></i>`
            
            elem.setAttribute('aria-checked',"true")
            elem.dataset.bookmarkid=data.id
            console.log('updated ds', elem.dataset)

        });

    }else if (elem.getAttribute("class").includes("marked")){
        
        fetch("/api/bookmarks/"+elem.dataset.bookmarkid, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')  
        }
        }).then(response => response.json()).then(data => {
            console.log(data);
            elem.classList.add('unmarked')
            elem.classList.remove('marked')
            
            elem.innerHTML = `<i class="far fa-bookmark"></i>`
            
            elem.setAttribute('aria-checked',"false")
            // displayPosts();


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