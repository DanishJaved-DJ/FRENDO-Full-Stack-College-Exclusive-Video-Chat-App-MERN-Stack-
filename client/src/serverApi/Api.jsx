const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;

const Api={
    Signup : {
                url: `${backendDomain}/api/v1/users/signup`,
                method: "POST",
    },
    login : {
        url: `${backendDomain}/api/v1/users/login`,
        method: "POST",
    },
    logout : {
        url: `${backendDomain}/api/v1/users/logout`,
        method: "POST",
    },
    profile : {
        url: `${backendDomain}/api/v1/users/user-profile`,
        method: "GET",
    },
    avatar :{
        url: `${backendDomain}/api/v1/users/avatar`,
        method: "PUT",
    },
    updateProfile : {
        url: `${backendDomain}/api/v1/users/updateProfile`,
        method: "PUT",
    },
    friendResponse :{
        url: `${backendDomain}/api/v1/users/friend-response`,
        method: "POST",
        } ,
    getFriends : {
        url: `${backendDomain}/api/v1/users/get-friends`,
        method: "GET",
        }
};

export default Api;