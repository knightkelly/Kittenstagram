window.onload = () => {
    
    let popularityCount = 0;
    let nextCommentId = 1;
    let allCommentsArray = [];

    //add heading that says "Kitten Pic"; centered
    const createHeader = () => {
        let kittenHeader = document.createElement("h1");
        kittenHeader.innerText = "Kittenstagram";
        kittenHeader.setAttribute("id", "kitten-header");
        document.body.appendChild(kittenHeader);
    }

    //add picture taken from the api; centered
    const addCatPhoto = (url) => {
        let catPhoto = document.createElement("img");
        catPhoto.setAttribute("src", url);
        catPhoto.setAttribute("alt", "an alternating photo of a cat!");
        catPhoto.setAttribute("id", "main-cat-photo");
        document.body.appendChild(catPhoto);
        return catPhoto;
    }
 
    //there is no reason this one is added every time except that i loved it ^_^
    const addFavoriteLittleCatGif = () => {
        addCatPhoto("https://cdn2.thecatapi.com/images/6rb.gif");
    }

    //get catInfo object
    const getCatInfoFromAPIRes = () => {
        let url = "https://api.thecatapi.com/v1/images/search";
        let catInfo = fetch(url).then(res => res.text())
            .then(res => JSON.parse(res)[0]);

        return catInfo; //this returns a promise with object catInfo, keys (height, id, url, width)
    }

    //the following two functions are probably superfluous
    //get image URL
    const getURLFromCatInfo = (catInfo) => {
        return catInfo.url;
    }

    //get image width
    const getWidthFromCatInfo = (catInfo) => {
        return catInfo.width;
    }

    //add normal random photo at top
    const addPhotosFromURL = () => {
        getCatInfoFromAPIRes().then(res => {
            let catURL = getURLFromCatInfo(res);
            let width = getWidthFromCatInfo(res);
            let mainCatPhotoEl = document.getElementById("main-cat-photo");
            
            if (!mainCatPhotoEl) {
                mainCatPhotoEl = addCatPhoto(catURL);
            } else if (mainCatPhotoEl) {
                mainCatPhotoEl.setAttribute("src", catURL);
            }

            addCatPhotoFeatures(res, mainCatPhotoEl, width);  
        });
    }

    //process additional tasks after adding or changing main cat photo
    //adjust width, add interactive elements, put cat in local storage
    const addCatPhotoFeatures = (catObj, catPhotoEl, width) => {
        adjustWidth(catPhotoEl, width);
        addInteractiveElements();
        storeCatObj(catObj);
    }

    const storeCatObj = (catObj) => {
        let catObjString = JSON.stringify(catObj);
        localStorage.setItem("catObj", catObjString);
    }

    const addInteractiveElements = () => {
        let scoreLabel = document.getElementById("score-label-p");
        if (!scoreLabel) {
            addPopularityScore();
            addCommentForm();
            addCommentDisplay();
        }
    } 

    //adjust width to fit page if wider than 1000px
    const adjustWidth = (imageElement, width) => {
        if (width > 1000) {
            imageElement.setAttribute("class", "too-wide");
        }
    }

    //restore cat or get new cat if nothing to restore
    const restoreCatInfo = () => {
        let catObjString = localStorage.getItem("catObj");
        if (catObjString) {
            let catObj = JSON.parse(catObjString);
            let mainCatPhotoEl = document.getElementById("main-cat-photo");

            addCatPhoto(catObj.url);
            addCatPhotoFeatures(catObj, mainCatPhotoEl, catObj.width);
        } else {
            addPhotosFromURL();
        }

        let popularity = localStorage.getItem("popularity");
        if (popularity) {
            popularityCount = popularity;
            adjustPopularity();
        }

        let comments = localStorage.getItem("comments");
        if (comments) {
            if (comments.length > 0) {
                let commentsArray = comments.split("  ,");
                commentsArray.forEach(comment => {
                    addNewCommentToDisplay(comment);
                });
            }
        }
    }

    //add only gifs at bottom
    const getOnlyGifs = () => {
        let apiRes = getCatInfoFromAPIRes().then(res => getURLFromCatInfo(res));
        let splitString = apiRes.then(res => res.split(".")).then(res => res[res.length - 1]);
        splitString.then(res => {
            if (res !== "gif") {
                getOnlyGifs();
            } else {
                apiRes.then(res => {
                    let gifURL = res;
                    addCatPhoto(gifURL);
                    addFavoriteLittleCatGif();
                });
            }
        });
    }

    const resetPopularityCount = () => {
        popularityCount = 0;
        adjustPopularity();
    }

    const resetComments = () => {
        let allComments = document.getElementsByClassName("comment-div");

        for (let i = allComments.length - 1; i >= 0; i--) {
            let comment = allComments[i];
            comment.remove();
        }

        allCommentsArray = [];
        localStorage.setItem("comments", allCommentsArray);
    }

    //get a new cat and reset the popularity and comments
    const getNewCat = () => {
        addPhotosFromURL();
        resetPopularityCount();
        resetComments();
    }

    //button that requests a new cat
    const addNewCatButton = () => {
        let newCatButton = document.createElement("button");
        newCatButton.innerText = "Get a new cat";
        newCatButton.setAttribute("id", "new-cat-button");
        document.body.appendChild(newCatButton);
        newCatButton.addEventListener("click", getNewCat);
    }

    //the section showing cat's popularity count... maybe badly named
    const addScoreKeeperDiv = () => {
        let scoreLabel = document.createElement("p");
        let scoreCount = document.createElement("span");

        scoreLabel.innerText = "Popularity Score: ";
        scoreLabel.setAttribute("id", "score-label-p");
        scoreCount.innerText = popularityCount;
        scoreCount.setAttribute("id", "score-count");

        scoreLabel.appendChild(scoreCount);
        document.body.appendChild(scoreLabel);
    }

    const adjustPopularity = () => {
        let scoreCount = document.getElementById("score-count");
        scoreCount.innerText = popularityCount;
        localStorage.setItem("popularity", popularityCount);
    }

    const upvoteThatCat = () => {
        popularityCount++;
        adjustPopularity();
    }

    const downvoteThatCat = () => {
        popularityCount--;
        adjustPopularity();
    }

    //buttons to up or down vote the cat
    const addVoteButtons = () => {
        let newDiv = document.createElement("div");
        let upvoteButton = document.createElement("button");
        let downvoteButton = document.createElement("button");

        newDiv.setAttribute("id", "vote-buttons-div");

        upvoteButton.innerText = "Upvote";
        upvoteButton.setAttribute("class", "vote-button");
        upvoteButton.setAttribute("id", "upvote-button");
        upvoteButton.addEventListener("click", upvoteThatCat);

        downvoteButton.innerText = "Downvote";
        downvoteButton.setAttribute("class", "vote-button");
        downvoteButton.setAttribute("id", "downvote-button");
        downvoteButton.addEventListener("click", downvoteThatCat);

        newDiv.appendChild(upvoteButton);
        newDiv.appendChild(downvoteButton);
        document.body.appendChild(newDiv);
    }

    //div that displays "popularity score: " and then counts the votes (up/down) so far
    const addPopularityScore = () => {
        addScoreKeeperDiv();
        addVoteButtons();
    }

    //create form to make comments
    const addCommentForm = () => {
        let commentForm = document.createElement("form");
        let commentLabel = document.createElement("label");
        let commentInput = document.createElement("input");
        let commentSubmit = document.createElement("button");

        commentLabel.innerText = "Comment:";
        commentLabel.setAttribute("id", "comment-label");
        commentLabel.setAttribute("for", "comments");

        commentInput.setAttribute("id", "comment-input");
        commentInput.setAttribute("name", "comments");
        commentInput.setAttribute("type", "text");

        commentSubmit.innerText = "Submit";
        commentSubmit.setAttribute("id", "comment-submit-button");

        commentForm.setAttribute("id", "comment-form");
        commentForm.appendChild(commentLabel);
        commentForm.appendChild(commentInput);
        commentForm.appendChild(commentSubmit);
        commentForm.addEventListener("submit", e => {
            e.preventDefault();
            let formData = new FormData(commentForm);

            for (const [name, value] of formData) {
                if (name === "comments") {
                    addNewCommentToDisplay(value);
                }
            }
        });

        document.body.appendChild(commentForm);
    }

    //delete a specific comment
    const deleteComment = (e) => {
        let button = e.target;
        let id = button.id.split("-")[2];

        let divToDelete = document.getElementById("comment-div-" + id);
        divToDelete.remove();
    }

    //add a new comment and delete button
    const addNewCommentToDisplay = (commentText) => {
        let commentDisplayDiv = document.getElementById("comment-display-div");
        let newCommentDiv = document.createElement("div");
        let comment = document.createElement("p");
        let deleteButton = document.createElement("button");

        let id = nextCommentId;
        nextCommentId++;

        allCommentsArray.push(commentText + "  ");
        localStorage.setItem("comments", allCommentsArray);

        newCommentDiv.setAttribute("id", "comment-div-" + id);
        newCommentDiv.setAttribute("class", "comment-div");
        comment.setAttribute("id", "comment-" + id);
        comment.innerText = commentText;
        deleteButton.setAttribute("id", "delete-comment-" + id);
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener("click", deleteComment);

        newCommentDiv.appendChild(comment);
        newCommentDiv.appendChild(deleteButton);

        commentDisplayDiv.appendChild(newCommentDiv);
    }

    //create div to group all comment children into
    const addCommentDisplay = () => {
        let commentDisplayDiv = document.createElement("div");
        commentDisplayDiv.setAttribute("id", "comment-display-div");
        document.body.appendChild(commentDisplayDiv);
    }

    const buildPage = () => {
        createHeader();
        addNewCatButton();
        restoreCatInfo();
        getOnlyGifs();
    }

    buildPage();
}