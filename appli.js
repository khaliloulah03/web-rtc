var peer;
var myStream;

function ajoutVideo(stream) {
    try {
        if (!stream || stream.getVideoTracks().length === 0) {
            throw new Error('Le flux vidéo est vide ou invalide.');
        }
        
        var video = document.createElement('video');
        video.autoplay = true;
        video.controls = true;
        video.srcObject = stream;
        
        var participantsDiv = document.getElementById('participants');
        if (!participantsDiv) {
            throw new Error('L\'élément #participants n\'existe pas dans le DOM.');
        }
        participantsDiv.appendChild(video);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la vidéo :', error);
        alert('Erreur lors de l\'affichage de la vidéo. Veuillez réessayer.');
    }
}

function register() {
    var name = document.getElementById('name').value;
    if (!name) {
        alert('Veuillez entrer votre nom.');
        return;
    }

    try {
        peer = new Peer(name, {
            debug: 2 // Active les logs de débogage
        });
        
        peer.on('open', id => {
            console.log('ID PeerJS ouvert :', id);
        });

        peer.on('error', err => {
            console.error('Erreur PeerJS :', err);
            alert('Erreur PeerJS : ' + err);
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                myStream = stream;
                ajoutVideo(stream);
                
                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';
                
                peer.on('call', call => {
                    console.log('Appel reçu de :', call.peer);
                    call.answer(myStream);
                    call.on('stream', remoteStream => {
                        console.log('Flux distant reçu :', remoteStream);
                        ajoutVideo(remoteStream);
                    });
                });
            })
            .catch(err => {
                console.error('Erreur d\'accès à la webcam :', err);
                alert('Impossible d\'accéder à la webcam. Vérifiez vos permissions.');
            });
    } catch (error) {
        console.error('Erreur PeerJS :', error);
        alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    }
}

function appelUser() {
    var name = document.getElementById('add').value;
    if (!name) {
        alert('Veuillez entrer l\'ID de l\'utilisateur.');
        return;
    }
    
    try {
        var call = peer.call(name, myStream);
        console.log('Appel vers :', name, 'avec le flux :', myStream);
        
        call.on('stream', remoteStream => {
            console.log('Flux distant reçu :', remoteStream);
            ajoutVideo(remoteStream);
        });
        
        call.on('error', err => {
            console.error('Erreur lors de l\'appel :', err);
            alert('Erreur lors de l\'appel. Veuillez réessayer.');
        });
    } catch (error) {
        console.error('Erreur lors de l\'appel :', error);
        alert('Erreur lors de l\'appel. Veuillez réessayer.');
    }
}

function addScreenShare() {
    var name = document.getElementById('share').value;
    if (!name) {
        alert('Veuillez entrer l\'ID de l\'utilisateur.');
        return;
    }
    
    try {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            .then(stream => {
                console.log('Partage d\'écran activé :', stream);
                var call = peer.call(name, stream);
                
                call.on('stream', remoteStream => {
                    console.log('Flux distant reçu pour partage d\'écran :', remoteStream);
                    ajoutVideo(remoteStream);
                });
                
                call.on('error', err => {
                    console.error('Erreur de partage d\'écran :', err);
                    alert('Erreur lors du partage d\'écran. Veuillez réessayer.');
                });
            })
            .catch(err => {
                console.error('Erreur de partage d\'écran :', err);
                alert('Impossible de partager l\'écran. Vérifiez vos permissions.');
            });
    } catch (error) {
        console.error('Erreur de partage d\'écran :', error);
        alert('Erreur lors du partage d\'écran. Veuillez réessayer.');
    }
}
