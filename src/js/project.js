let page = 1;

const fetchOptions = {
  cache: 'force-cache',
};

const fetchData = async (page, pageSize = 2) => {
  try {
    const cachedPosts = localStorage.getItem(`cachePorts-${page}`);
    const cachedUsers = localStorage.getItem(`cacheUsers`);

    if (cachedPosts && cachedUsers) {
      console.log('Data from local storage.');
      return [JSON.parse(cachedPosts), JSON.parse(cachedUsers)];
    }

    const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${pageSize}`, fetchOptions);
    const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users', fetchOptions);

    if (!postsResponse.ok || !usersResponse.ok) {
      throw new Error(`Status: Failed to fetch`);
    }

    const [posts, users] = await Promise.all([
      postsResponse.json(),
      usersResponse.json(),
    ]);

    localStorage.setItem(`cachePorts-${page}`, JSON.stringify(posts));
    localStorage.setItem('cacheUsers', JSON.stringify(users));

    return [posts, users];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const getUserForPost = (userId, users) => {
  const user = users.find((user) => user.id === userId);
  return [user.name, user.email];
};

const getCommentsForPost = async (postIdva) => {
  try {
    const cachedComments = localStorage.getItem(`cachedComments_${postIdva}`);

    if (cachedComments) {
      return JSON.parse(cachedComments);
    }

    const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${postIdva}/comments`, fetchOptions);

    if (!commentsResponse.ok) {
      throw new Error(`Status: Failed to fetch`);
    }

    const comments = await commentsResponse.json();

    const commentData = comments.map((comment) => ({
      email: comment.email,
      body: comment.body,
    }));

    localStorage.setItem(`cachedComments_${postIdva}`, JSON.stringify(commentData));

    return commentData;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};


const drawComments = async (CommentsExpanded, commentData) =>{
  let CommentArray = [];
  if (CommentsExpanded || commentData.length <= 2) {
    commentData.forEach((comment) => {
      CommentArray.push(`
      <div class="d-flex align-items-start mt-3 flex-wrap flex-sm-nowrap">
            <img width="35" height="35" class="me-2 avatar-sm rounded-circle" src="https://api.dicebear.com/6.x/fun-emoji/svg?seed=${comment.email}" alt="${comment.email} Avatar">
            <div class="w-100">
                <div class="d-flex justify-content-between">
                    <h6 class="mt-2 mb-0">${comment.email}</h6>
                </div>
                <p class="fs-6 mt-3 mb-0 fw-light">
                    ${comment.body}
                </p>
            </div>
        </div>
      `);
    });
  } else {
    for (let i = 0; i < 2; i++) {
      if (commentData[i]) {
        CommentArray +=`
      <div class="d-flex align-items-start mt-3 flex-wrap flex-sm-nowrap">
            <img width="35" height="35" class="me-2 avatar-sm rounded-circle" src="https://api.dicebear.com/6.x/fun-emoji/svg?seed=${commentData[i].email}" alt="${commentData[i].email} Avatar">
            <div class="w-100">
                <div class="d-flex justify-content-between">
                    <h6 class="mt-2 mb-0">${commentData[i].email}</h6>
                </div>
                <p class="fs-6 mt-3 mb-0 fw-light">
                    ${commentData[i].body}
                </p>
            </div>
        </div>
        `;
      }
    }
  }
  return CommentArray;
};

const displayPosts = async () => {
  try {
    const postsContainer = document.querySelector('#posts-container');
    const loading = document.querySelector('.spinner-body');
    const space = document.querySelector('.loading-space');
    space.style.display = 'block';
    loading.style.display = 'block';
    loading.style.opacity = '0';

    // Fetch [posts, comments, users]
    const data = await fetchData(page);

    const posts = data[0];
    // const comments = data[1];
    const users = data[1];

    for (const post of posts) {
      const PostElement = document.createElement('div');
      PostElement.classList.add('post-element');
      PostElement.setAttribute('data-comments-expanded', 'false');

      // get comments for posts
      const CommentsExpanded = false;
      const commentData = await getCommentsForPost(post.id);
      const displayComments = await drawComments(CommentsExpanded, commentData);

      // Get users for posts and comments
      const [AuthorPost, AuthorEmail] = getUserForPost(post.userId, users);


      PostElement.innerHTML = `
        <div class="card position-relative mt-3">
          <h5 class="fs-6 fw-light text-muted mt-0 number-to-help position-absolute">Post number: ${post.id}</h5>
          <div class="px-3 pt-4 pb-2">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <img width="50" height="50" class="me-2 avatar-sm rounded-circle" src="https://api.dicebear.com/6.x/fun-emoji/svg?seed=${AuthorPost}" alt="${AuthorPost.split(' ')[0]}">
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
                <div class="comments-element">
                  ${displayComments}
                </div>
                <div class="mt-3 d-flex justify-content-center">
                  <button type="submit" data-id="${post.id}" class="btn btn-sm btn-dark expand-comments"> load more comments </button>
                </div>
            </div>
          </div>
        </div>
      `;

      postsContainer.appendChild(PostElement);
      loading.setAttribute('style', 'display:none !important');
      space.setAttribute('style', 'display:none !important');
      postsContainer.setAttribute('style', 'opacity:1');
    };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const ioOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.5,
};

let io;

const createIntersectionObserver = () => {
  io = new IntersectionObserver((entries) => {
    entries.forEach((entry) =>{
      if (entry.intersectionRatio > 0) {
        page++;
        displayPosts();
      }
    });
  }, ioOptions);
};

const observeFooter = () => {
  const container = document.querySelector('.footer-container');
  io.observe(container);
};

const expandComments = () => {
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('expand-comments')) {
      const postElement = event.target.closest('.post-element');
      if (postElement) {
        postElement.querySelector('.expand-comments').style.display = 'none';
        const postId = event.target.getAttribute('data-id');
        postElement.setAttribute('data-comments-expanded', 'true');
        const areCommentsExpanded = postElement.getAttribute('data-comments-expanded') === 'true';

        try {
          const commentElement = postElement.querySelector('.comments-element');
          const commentData = await getCommentsForPost(postId);
          const ExpandedComments = await drawComments(areCommentsExpanded, commentData);

          // Clear existing comments
          commentElement.innerHTML = '';

          // Inject the comments into the DOM
          ExpandedComments.forEach((commentHtml) => {
            commentElement.innerHTML += commentHtml;
          });
        } catch (error) {
          console.error(error.message);
          throw error;
        }
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  displayPosts()
  // observe ending
  createIntersectionObserver()
  observeFooter()
  // expand comments
  expandComments()
});
