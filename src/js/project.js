const fetchData = async (page = 1, pageSize = 3) => {
  try {
    const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${pageSize}`);
    const commentsResponse = await fetch('https://jsonplaceholder.typicode.com/comments');
    const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users');

    if(!postsResponse.ok || !commentsResponse.ok || !usersResponse.ok){
      throw new Error(`Status: Failed to fetch`);
    }
  
    const [posts, comments, users] = await Promise.all([
      postsResponse.json(),
      commentsResponse.json(),
      usersResponse.json(),
    ]);

    return [posts, comments, users];
    
  } catch (error) {
    console.log(error.message);
  }

};

const getUserForPost = (userId, users) =>{
  const user = users.find(user => user.id === userId);
  return [user.name, user.email];
};

const getCommentsForPost = (postIdva, comments) =>{
  const filteredComments = comments.filter(comment => comment.postId === postIdva);
  const comment = comments.filter(comment => comment.postId === postIdva);

  const commentData = comment.map(comment => ({
    email: comment.email,
    body: comment.body
  }));

  return commentData;
};

const displayPosts = async () => {
  try {
    // Fetch [posts, comments, users]
    const data = await fetchData();

    const posts = data[0];
    const comments = data[1];
    const users = data[2];

    const postsContainer = document.querySelector('#posts-container');

    posts.forEach(post => {
      let  PostElement = document.createElement('div');
      PostElement.classList.add('post-element');

      const commentData = getCommentsForPost(post.id, comments);
      const [AuthorPost, AuthorEmail] = getUserForPost(post.userId, users);
      
      let CommentElement = '';
      commentData.forEach(comment => {
        CommentElement += `
        <div class="d-flex align-items-start mt-3">
              <img style="width:35px" class="me-2 avatar-sm rounded-circle"
                  src="https://api.dicebear.com/6.x/fun-emoji/svg?seed=${comment.email}"
                  alt="${comment.email} Avatar">
              <div class="w-100">
                  <div class="d-flex justify-content-between">
                      <h6 class="">${comment.email}</h6>
                  </div>
                  <p class="fs-6 mt-3 fw-light">
                      ${comment.body}
                  </p>
              </div>
          </div>
        `;
      });

      PostElement.innerHTML = `
        <div class="card mt-3">
          <div class="px-3 pt-4 pb-2">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <img width="50" height="50" class="me-2 avatar-sm rounded-circle loading="lazy" src="https://api.dicebear.com/6.x/fun-emoji/svg?seed=${AuthorPost}" alt="${AuthorPost.split(' ')[0]}">
                <div>
                  <p class="name mb-0">${AuthorEmail}</p>
                  <h5 class="card-title mb-0">${post.title}</h5>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <p class="fs-6 fw-light text-muted mt-0">${post.body}</p>
            <div>
              <form action="" method="POST">
                  <div class="mb-3">
                      <textarea name="content" class="fs-6 form-control" rows="1"></textarea>
                  </div>
                  <div>
                      <button type="submit" class="btn btn-primary btn-sm"> Post Comment </button>
                  </div>
              </form>
                <hr>
                <div>
                  ${CommentElement}
                </div>
            </div>
          </div>
        </div>
      `;

      postsContainer.appendChild(PostElement);
    });
  }catch(error){
    console.log(error.message);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  displayPosts();
});