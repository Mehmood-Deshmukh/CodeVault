import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  FaUser,
  FaRegArrowAltCircleUp,
  FaRegArrowAltCircleDown,
  FaComment,
  FaArrowDown,
  FaStar,
  FaThumbtack,
} from "react-icons/fa";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { iconSrcList } from "../utils/icons";
import { useNavigate } from "react-router-dom";
import { Autocomplete } from "../components/Autocomplete";
import ImageViewer from "react-simple-image-viewer";
import { useFetchPosts } from "../hooks/useFetchPosts";
import { useFetchUsers } from "../hooks/useFetchUsers";
import InfiniteScroll from "react-infinite-scroll-component";
import { SyncLoader } from "react-spinners";
import DeleteConfirmation from "../components/DeleteConfirmation";
export const Explore = () => {
  const [page, setPage] = useState(2);
  const {
    postsLoading,
    fetchPublicPosts,
    fetchMostFavouritedSnippets,
    fetchPublicPostsBatch,
  } = useFetchPosts();
  const { fetchPublicUsers, publicUsersLoading, mostfollowed } =
    useFetchUsers();
  const { user, dispatch, posts, fetched, mostFavouritedSnippets } =
    useAuthContext();
  const navigate = useNavigate();
  const [allstudents, setAllStudents] = useState([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentSrcSet, setCurrentSrcSet] = useState([]);
  const srcSet = [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePostId, setDeletePostId] = useState("");
  const [followingFeed, setFollowingFeed] = useState([]);
  const [followingFeedOpen, setFollowingFeedOpen] = useState(false);
  const [activeFeed, setActiveFeed] = useState("trending");
  const [feedPosts, setFeedPosts] = useState([]);

  useEffect(() => {
    if (activeFeed == "following") {
      setFollowingFeedOpen(true);
      if (posts) {
        let followfeed = posts.filter((post) => {
          return user.following.some(
            (followingUser) => followingUser.username === post.author.username
          );
        });
        setFollowingFeed(followfeed);
      }
    } else {
      setFollowingFeedOpen(false);
    }

    if (posts) {
      if (activeFeed === "all") {
        setFeedPosts(posts);
        return;
      } else {
        let feedposts = posts.filter((post) => post.tags.includes(activeFeed));
        setFeedPosts(feedposts);
      }
    }
  }, [posts, activeFeed]);

  const tags = [
    "all",
    "trending",
    "new",
    "popular",
    "top",
    "non-tech",
    "following",
  ];
  async function fetchAllUsers() {
    try {
      const response = await fetch(BASE_URL + "api/public/getallusers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setAllStudents(data);
    } catch (error) {
      console.error(error);
    }
  }

  function truncateDescription(description, maxLength) {
    if (description.length > maxLength) {
      return description.slice(0, maxLength) + "...";
    }
    return description;
  }
  async function Upvote(e, post) {
    e.preventDefault();
    e.stopPropagation();
    try {
      let userObj = {
        username: user.username,
        avtar: user.avtar,
      };
      if (post.upvotes.some((obj) => obj.username == user.username)) {
        return;
      }
      e.target.lastElementChild.innerHTML = post.upvotes.length + 1;
      post.upvotes.push({
        username: user.username,
        avtar: user.avtar,
      });
      if (post.downvotes.some((obj) => obj.username == user.username)) {
        e.target.nextSibling.lastElementChild.innerHTML =
          post.downvotes.length - 1;
        post.downvotes = post.downvotes.filter(
          (obj) => obj.username !== user.username
        );
      }
      let response = await fetch(BASE_URL + "api/public/updateupvotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: post._id, userObj }),
      });
      if (response.ok) {
        toast.success("added to upvoted posts");
      } else {
        toast.error("error upvoting post");
      }
    } catch (error) {
      console.log("error upvoting post : ", error.message);
    }
  }

  async function Downvote(e, post) {
    e.preventDefault();
    e.stopPropagation();
    try {
      let userObj = {
        username: user.username,
        avtar: user.avtar,
      };

      if (post.downvotes.some((obj) => obj.username == user.username)) {
        return;
      }

      e.target.lastElementChild.innerHTML = post.downvotes.length + 1;
      post.downvotes.push(userObj);
      if (post.upvotes.some((obj) => obj.username == user.username)) {
        e.target.previousSibling.lastElementChild.innerHTML =
          post.upvotes.length - 1;
        post.upvotes = post.upvotes.filter(
          (obj) => obj.username !== user.username
        );
      }

      let response = await fetch(BASE_URL + "api/public/updatedownvotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: post._id, userObj }),
      });

      if (response.ok) {
        toast.success("added to downvoted posts");
      } else {
        toast.error("error downvoting post");
      }
    } catch (error) {
      console.log("error downvoting post : ", error.message);
    }
  }

  useEffect(() => {
    fetchAllUsers();
    // fetchMostFollowed();
    fetchPublicUsers();
    fetchMostFavouritedSnippets();
    console.log(mostFavouritedSnippets);
    if (!fetched) {
      fetchPublicPosts();
    }

    if (posts) {
      let followfeed = posts.filter((post) => {
        return user.following.some(
          (followingUser) => followingUser.username === post.author.username
        );
      });
      setFollowingFeed(followfeed);
      console.log(followingFeed);
    }
  }, []);

  function localFollow(e, userObj) {
    if (userObj.username == user.uername) {
      toast.info("You cannot follow Yourself!");
      return;
    }
    switch (e.target.innerText) {
      case "Follow": {
        user.following.push(userObj);
        console.log(user);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "UPDATE", payload: user });
        return;
      }
      case "Unfollow": {
        user.following = user.following.filter(
          (User) => userObj.username != User.username
        );
        console.log(user);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "UPDATE", payload: user });
        return;
      }
      default: {
        toast.warn("Unexpected Behaviour!");
        return;
      }
    }
  }

  async function handleFollowButton(e, userobj) {
    console.log(e.target.innerText);
    if (userobj.username == user.uername) {
      toast.info("You cannot follow Yourself!");
      return;
    }
    localFollow(e, userobj);
    switch (e.target.innerText) {
      case "Follow": {
        try {
          const response = await fetch(BASE_URL + "api/user/follow", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              username: user.username,
              followObj: userobj,
            }),
          });
          if (response.ok) {
            toast.success("Follow successful!");
          }
        } catch (error) {
          console.error(error.message);
          toast.error("Error following user!");
        }
        return;
      }
      case "Unfollow": {
        try {
          const response = await fetch(BASE_URL + "api/user/unfollow", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              username: user.username,
              followObj: userobj,
            }),
          });
          if (response.ok) {
            toast.success("Follow successful!");
          }
        } catch (error) {
          console.error(error.message);
          toast.error("Error unfollowing user!");
        }
        return;
      }
      default: {
        toast.warn("Unexpected Behaviour!");
        return;
      }
    }
  }

  async function handleDelete(id) {
    setDeletePostId(id);
    setShowDeleteConfirmation(true);
  }

  async function handleDeletePost() {
    try {
      const id = deletePostId;
      const response = await fetch(BASE_URL + "api/public/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        toast.success("Post deleted successfully!");
        sessionStorage.setItem(
          "posts",
          JSON.stringify(posts.filter((post) => post._id !== id))
        );
        dispatch({ type: "DELETE_POST", payload: id });
      } else {
        toast.error("Error deleting post!");
      }

      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error(error.message);
      toast.error("Error deleting post!");
    }
  }
  function scrollLeft(container) {
    container.scrollBy({ left: -250, behavior: "smooth" });
  }

  function scrollRight(container) {
    container.scrollBy({ left: 250, behavior: "smooth" });
  }

  function createMostFollowedUsersDiv(userobj) {
    if (userobj.username === user.username) {
      return;
    }
    return (
      <div
        class="w-[18vw] min-w-[250px] my-2 shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded-lg sahdow-lg p-12 flex flex-col justify-center items-center h-full"
        onClick={() => {
          userobj.username === user.username
            ? navigate("/profile")
            : navigate(`/viewprofile?username=${userobj?.username}`);
        }}
      >
        <div className="h-full">
          <img
            class="object-center object-cover rounded-full h-36 w-36"
            src={
              userobj?.avtar.length > 15
                ? userobj.avtar
                : iconSrcList[userobj?.avtar || "user"]
            }
            alt="photo"
          />
        </div>
        <div class="text-center mt-4">
          <p class="text-xl whitespace-nowrap text-black font-bold mb-2">
            {userobj.username}
          </p>
          <button
            onClick={(e) => handleFollowButton(e, userobj)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md mt-2 hover:bg-slate-700"
          >
            {user.following.some(
              (followingUser) => followingUser.username === userobj.username
            )
              ? "Unfollow"
              : "Follow"}
          </button>
        </div>
      </div>
    );
  }

  function getMonthFromIndex(index) {
    switch (index) {
      case 0:
        return "Jan";
      case 1:
        return "Feb";
      case 2:
        return "Mar";
      case 3:
        return "Apr";
      case 4:
        return "May";
      case 5:
        return "Jun";
      case 6:
        return "Jul";
      case 7:
        return "Aug";
      case 8:
        return "Sep";
      case 9:
        return "Oct";
      case 10:
        return "Nov";
      case 11:
        return "Dec";
      default:
        return "Invalid month index";
    }
  }

  function displaySnippets(snippet, isPinned = false) {
    const month = getMonthFromIndex(
      Number.parseInt(snippet.dateCreated.split("-")[1]) - 1
    );
    const day = snippet.dateCreated.split("-")[2].split("T")[0];
    const date = `${month} ${day}`;

    console.log(user.username, snippet.author);

    return (
      <article
        key={snippet._id}
        className="flex bg-white transition hover:shadow-xl w-[29%] border-2 rounded-xl m-[20px] min-w-[340px]"
      >
        {isPinned && (
          <FontAwesomeIcon
            icon={faThumbtack}
            className="text-yellow-500 text-xl ml-2 mt-2"
          />
        )}
        <div className="rotate-180 p-2 [writing-mode:_vertical-lr]">
          <time
            // dateTime={date}
            className="flex items-center justify-between gap-4 text-xs font-bold uppercase text-gray-900"
          >
            <span>{date}</span>
            <span className="w-px flex-1 bg-gray-900/10"></span>
            <span>
              {/* {getMonthAndDayFromSeconds(snippet.dateCreated.seconds)} */}
            </span>
          </time>
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="border-s border-gray-900/10 p-4 sm:border-l-transparent sm:p-6 min-h-[150px]">
            <a href="#">
              <h3 className="font-bold uppercase text-gray-900">
                {snippet.title}
              </h3>
            </a>
            <p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-700">
              <span className="font-bold text-gray-900">Description:</span>{" "}
              {truncateDescription(snippet.description || "N/A", 17)}
            </p>
            <p>
              <span className="font-bold text-gray-900">Language:</span>{" "}
              {snippet.language}
            </p>
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={() => {
                if (snippet.author == user.id) {
                  navigate(`/snippets?id=${snippet._id}`);
                } else {
                  navigate(`/viewpublicsnippet?snippetId=${snippet._id}`);
                }
              }}
              className="block bg-black px-5 py-3 text-center text-xs font-bold uppercase text-white transition hover:bg-slate-600 rounded-br-xl"
            >
              Open
            </button>
          </div>
        </div>
      </article>
    );
  }

  const calculateTimeAgo = (createdAt) => {
    const currentTime = new Date();
    const postTime = new Date(createdAt);
    const timeDifference = currentTime - postTime;
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference > 0) {
      return `${daysDifference} day${daysDifference > 1 ? "s" : ""} ago`;
    } else if (hoursDifference > 0) {
      return `${hoursDifference} hour${hoursDifference > 1 ? "s" : ""} ago`;
    } else {
      return `${minutesDifference} minute${
        minutesDifference > 1 ? "s" : ""
      } ago`;
    }
  };
  function createPostsDiv(post, id) {
    if (post.files) {
      let filesrc = post.files.map(
        (file) =>
          `${BASE_URL}api/public/files?filename=${encodeURIComponent(file)}`
      );
      srcSet.push(filesrc);
    }
    return (
      <div
        key={id}
        className="w-[90%] md:w-[60%] mx-auto border border-gray-300 p-4 my-4 rounded-lg shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]" // shadow-[rgba(0,_0,_0,_0.2)_0px_10px_10px]
        style={{ zIndex: -99 }}
      >
        {isViewerOpen && (
          <div style={{ position: "absolute", zIndex: 999999 }}>
            <ImageViewer
              src={currentSrcSet}
              currentIndex={currentIndex}
              onClose={() => setIsViewerOpen(false)}
            />
          </div>
        )}
        <p
          onClick={() => {
            post.author.username === user.username
              ? navigate("/profile")
              : navigate(`/viewprofile?username=${post.author.username}`);
          }}
          className="flex items-center gap-2 text-black text-md font-bold mb-2 border-b border-gray-200 p-2"
        >
          {(
            <img
              src={
                post?.author?.avtar?.length > 15
                  ? post.author.avtar
                  : iconSrcList[post.author.avtar]
              }
              className="hoverZoomLink w-8 h-8 rounded-full object-cover mx-3"
            />
          ) || <FaUser className="border border-black p-1 rounded-full" />}
          {post.author.username}
          {!post?.isPublic && <FaStar title="This is a private post." />}
          <span className="text-sm ml-2 text-gray-500">
            {calculateTimeAgo(post.createdAt)}
          </span>
        </p>
        <h1 className="text-xl mb-2">
          <p
            style={{ width: "95%", margin: "0 auto" }}
            className="font-bold text-md"
          >
            {" "}
            {post.title || "Awesome Title"}
          </p>
        </h1>
        <h1 className="text-xl">
          <span className="font-semibold"> </span>
          <p
            style={{ width: "95%", margin: "10px auto", marginTop: 0 }}
            className="bg-light-off-white border border-gray-200 p-4 text-sm max-h-[30vh] overflow-scroll rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          >
            {/* {post.content ? "this is a description." :} */}
          </p>
        </h1>
        <div className="w-[95%] mx-auto flex flex-wrap">
          {post?.files?.length
            ? post.files.map((file, index) => {
                return (
                  <img
                    onClick={() => {
                      setCurrentIndex(index);
                      setCurrentSrcSet(srcSet[id]);
                      setIsViewerOpen(true);
                    }}
                    src={`${BASE_URL}api/public/files?filename=${encodeURIComponent(
                      file
                    )}`}
                    alt="post"
                    className="w-[40%] my-2 mx-2 h-fit object-cover rounded-lg h-[200px] cursor-pointer"
                  />
                );
              })
            : null}
        </div>

        <div className="w-full md:w-[95%] relative z-0 flex items-center justify-between mt-4 mx-[1.5vw]">
          <div className="w-[40%] md:w-[20%] flex justify-between items-center bg-black p-2 rounded-md -z-50">
            <div
              className="flex items-center gap-1 cursor-pointer z-99"
              onClick={(e) => Upvote(e, post)}
            >
              <FaRegArrowAltCircleUp
                style={{ zIndex: -1 }}
                className="text-white text-xl "
              />{" "}
              <span style={{ zIndex: -1 }} className="font-bold text-white">
                {post.upvotes.length}
              </span>
            </div>
            <div
              className="flex items-center z-99 gap-1 cursor-pointer"
              onClick={(e) => Downvote(e, post)}
            >
              <FaRegArrowAltCircleDown
                style={{ zIndex: -1 }}
                className="text-white text-xl -z-1"
              />{" "}
              <span
                style={{ zIndex: -1 }}
                className="font-bold -z-1 text-white"
              >
                {post.downvotes.length}
              </span>
            </div>
            <FaComment
              className="font-4xl cursor-pointer"
              color="white"
              onClick={() =>
                navigate(`/viewpost?id=${post._id}&avtar=${post.author.avtar}`)
              }
            />
            <span className="font-bold text-white">
              {post?.comments?.length}
            </span>
          </div>
          <div
            className={`${
              user.username == post.author.username ? "block" : "hidden"
            }`}
          >
            <button
              onClick={() => handleDelete(post._id)}
              className="block bg-red-500 px-5 py-3 text-center text-xs font-bold uppercase text-white transition hover:bg-red-600 rounded-xl mt-2 ml-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[15vh] mb-[10vh]">
      <h1 className="text-center text-xl font-bold">Ready to Explore?</h1>
      <Autocomplete data={allstudents} />

      <h1 className="text-center text-xl font-bold">Popular Users</h1>
      <div className="relative my-4 flex items-center">
        <button
          onClick={() =>
            scrollLeft(document.getElementById("mostFollowedContainer"))
          }
          className="absolute left-4 md:left-20 z-10 p-4 bg-gray-800 hover:bg-gray-600 text-white rounded-full"
        >
          &#10094;
        </button>
        <div
          id="mostFollowedContainer"
          className="flex items-center flex-row overflow-x-auto no-scrollbar gap-5 w-[70%] mx-auto px-4"
        >
          {mostfollowed.map(createMostFollowedUsersDiv)}
        </div>
        <button
          onClick={() =>
            scrollRight(document.getElementById("mostFollowedContainer"))
          }
          className="absolute right-4 md:right-20 z-10 p-4 bg-gray-800 hover:bg-gray-600 text-white rounded-full"
        >
          &#10095;
        </button>
      </div>
      <h1 className="text-center text-xl font-bold">Popular Snippets</h1>
      <div className="relative my-4 flex items-center">
        <div
          id="mostFavouritedSnippets"
          className="flex items-center flex-row overflow-x-auto no-scrollbar gap-5 w-full mx-auto px-4"
        >
          {mostFavouritedSnippets &&
            mostFavouritedSnippets.map((snippet) => displaySnippets(snippet))}
        </div>
      </div>

      <button
        onClick={() => {
          dispatch({ type: "UPDATE_FETCH_STATE", payload: false });
          sessionStorage.removeItem("posts");
          fetchPublicPosts();
          setPage(2);
        }}
        className="font-bold text-center flex gap-4 items-center text-xl m-auto"
      >
        <FaArrowDown /> Fetch Latest Posts....{" "}
      </button>
      <div className="flex justify-center mx-auto my-5 w-full sm:w-[80%] md:w-[60%] flex-wrap gap-2">
        {tags.map((tag) => {
          return (
            <button
              key={tag}
              className={`block ${
                activeFeed === tag
                  ? "bg-black text-white"
                  : "bg-transparent text-black"
              } hover:bg-gray-800 hover:text-white font-semibold py-2 px-4 border border-black hover:border-transparent rounded transition-all duration-300 ease-in-out`}
              onClick={() => setActiveFeed(tag)}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {postsLoading ? (
        <SyncLoader className="w-fit mx-auto my-4" />
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={() => {
            fetchPublicPostsBatch(page);
            setPage(page + 1);
          }}
          hasMore={!fetched}
          endMessage={
            <p style={{ textAlign: "center" }}>
              {!followingFeedOpen && <b>Yay! You have seen it all</b>}
            </p>
          }
        >
          {followingFeedOpen
            ? null
            : feedPosts?.map((post, index) => {
                return createPostsDiv(post, index);
              })}
        </InfiniteScroll>
      )}

      {followingFeedOpen ? (
        <InfiniteScroll
          dataLength={followingFeed.length}
          next={() => {
            fetchPublicPostsBatch(page);
            setPage(page + 1);
          }}
          hasMore={!fetched}
          endMessage={
            <p style={{ textAlign: "center" }}>
              {followingFeedOpen && <b>Yay! You have seen it all</b>}
            </p>
          }
        >
          {followingFeed.map((post, index) => createPostsDiv(post, index))}
        </InfiniteScroll>
      ) : null}

      <DeleteConfirmation
        type="post"
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onDelete={handleDeletePost}
      />
    </div>
  );
};
