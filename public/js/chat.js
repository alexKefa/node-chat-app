const socket = io()
// Elements 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
// We need access not to the element itself, but we need the HTML contained inside
// adding .innerHTML
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
// Takes in the query string (location.search)
// 2nd argument is options and ignoreQueryPrefix makes sure that
// the question mark in front of the 1st property of query string
// goes away. (?)

// Destructuring object that comes back from Qs.parse
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () =>{
    // New message element
    // .lastElementChild will grab the last element as a child,
    // which would be the new message
    const $newMessage = $messages.lastElementChild
    // Height of the new message

    // Get the margin value
    const newMessageStyles = getComputedStyle($newMessage)
    // parseInt() takes a string in and it parses it to a number
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    // Adding margin to height, getting the total height

    // Its' standard content including extra things like its' margin
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    // Render the template with 2 steps
    // 1. I need the template itself and two i need access to the place I want 
    // to render the template
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('H:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate , {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    // disable form

    // target represents the target we are listening for the event
    // on and in this case that's our form which we access.
    // elements gives us access to the name (message is the input name)
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        // enable form

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    // Some older browsers don't have support for geolocation api
    // which means if navigator.geolocation exists it does have support,
    // else it doesn't.
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')
    // position is an object and it contains the information we want to share.
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                return console.log(error)
            }
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})