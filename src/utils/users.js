const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        // Will return true only if this user is in the same room, while
        // also having the same name with the existing one
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    // findIndex is almost the same with find() with the difference that
    // if an item was found it will not return the array item back but the position of the array item
    
    // index is -1 if we didn't find a match and >=0 if we did
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        // Allows us to remove items from an array by their index
        // 1st argument is the position and 2nd is the number of items we want to remove
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}