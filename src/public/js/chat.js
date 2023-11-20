let chatBox = document.getElementById('chatBox')

Swal.fire({
    title: 'Autenticación',
    input: 'text',
    text: 'Establecer nombre de usuario para el Chat',
    inputValidator: (value) => {
        return !value.trim() && 'Por favor, escriba un nombre de usuario válido'
    },
    allowOutsideClick: false,
}).then((result) => {
    user = result.value
    document.getElementById("user").innerHTML = `<b>${user}: </b>`
    let socket = io()

    chatBox.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
        if (chatBox.value.trim().length > 0) {
            let newMessage = {
                user,
                message: chatBox.value,
            }
            socket.emit('message', newMessage)

            chatBox.value = ''
        }
        }
    })

    socket.on('logs', data => {
        const divLogs = document.getElementById('messagesLogs');
        let messages = ''
        data.reverse().forEach((message) => {
            messages += ` <div class='bg-secondary p-2 my-2 rounded-2'>
            <p><i>${message.user}</i>: ${message.message}</p>
            </div>`
        })
        divLogs.innerHTML = messages
    })

    socket.on('alerta', () => {
        Toastify({
            text: 'Un nuevo cliente conectado',
            duration: 1500,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#7dd56f",
                background: "-webkit-linear-gradient(to right, #28b487, #7dd56f)",
                background: "linear-gradient(to right, #28b487, #7dd56f)",
            },
            onClick: function () {},
        }).showToast()
    })
})