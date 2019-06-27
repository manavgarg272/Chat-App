const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const autoScroll = () =>{
    const $newMessage = $messages.lastElementChild

    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeigth = $newMessage.offsetHeight  +  newMessageMargin

   console.log('newMessageHeigth:' +  newMessageHeigth)
    //visible Height
    const visibleHeight = $messages.offsetHeight
    // console.log('visibleHeight' + visibleHeight)    
    //Height of the message container
    const containerHeight= $messages.scrollHeight
    // console.log('containerHeight' +  containerHeight)s
    //How far i have scrolled
    const scrollOffset= $messages.scrollTop + visibleHeight
    // console.log('scrollOffset:' + scrollOffset)

    // console.log('containerHeight - newMessageHeigth:' + containerHeight - newMessageHeigth)
    if(containerHeight - newMessageHeigth <=scrollOffset){
     $messages.scrollTop = $messages.scrollHeight
    }

}

const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix:true})
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username :message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoScroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room,users})=>{
  
  const html = Mustache.render(sideBarTemplate,{
      room,
      users
  })
 document.querySelector('#sidebar').innerHTML = html
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join' ,{username , room},(error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})