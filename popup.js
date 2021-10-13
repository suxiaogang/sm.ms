(function () {
    const API_TOKEN = '';

    const URL_PROFILE = 'https://sm.ms/api/v2/profile';
    const URL_UPLOAD = 'https://sm.ms/api/v2/upload';

    function getProfile() {
        var xhr = new XMLHttpRequest();
        var dataToSend = new FormData();
        xhr.open('POST', URL_PROFILE);
        xhr.setRequestHeader('Authorization', API_TOKEN);
        xhr.send(dataToSend);
        xhr.onload = function(e) {
            var res = xhr.response; // not responseText
            let resData = JSON.parse(res);
            console.log(resData.success);
            if (resData.success) {
                console.log(resData.data);
            }
        }
    }
    //getProfile();

    function moveCursorToEnd(el) {
        if (typeof el.selectionStart == "number") {
            el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange != "undefined") {
            el.focus();
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
        }
    }

    function Init() {
        console.log("Upload Initialised");
        var fileSelect = document.getElementById('file-upload'),
            fileDrag = document.getElementById('file-drag'),
            submitButton = document.getElementById('submit-button');
        fileSelect.addEventListener('change', fileSelectHandler, false);
        // Is XHR2 available?
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            // File Drop
            fileDrag.addEventListener('dragover', fileDragHover, false);
            fileDrag.addEventListener('dragleave', fileDragHover, false);
            fileDrag.addEventListener('drop', fileSelectHandler, false);
        }
        const tokenHide = document.querySelector('#token');
        tokenHide.addEventListener('click', function (e) {
            this.setAttribute('type', 'text');
            moveCursorToEnd(this);
            this.select();
            this.click();
        });
        tokenHide.addEventListener('blur', function (e) {
            this.setAttribute('type', 'password');
        });
    }

    function fileDragHover(e) {
        var fileDrag = document.getElementById('file-drag');
        e.stopPropagation();
        e.preventDefault();
        fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
    }

    function fileSelectHandler(e) {
        // Fetch FileList object
        var files = e.target.files || e.dataTransfer.files;
        // Cancel event and hover styling
        fileDragHover(e);
        // Process all File objects
        for (var i = 0, f; f = files[i]; i++) {
            parseFile(f);
            uploadFile(f);
        }
    }

    // Output
    function output(msg) {
        // Response
        var m = document.getElementById('messages');
        m.innerHTML = msg;
    }

    function parseFile(file) {
        console.log(file.name);
        output(
            '<strong>' + encodeURI(file.name) + '</strong>'
        );
        // var fileType = file.type;
        // console.log(fileType);
        var imageName = file.name;
        var isImageFile = (/\.(?=gif|jpg|png|jpeg)/gi).test(imageName);
        if (isImageFile) {
            document.getElementById('start').classList.add("hidden");
            document.getElementById('response').classList.remove("hidden");
            document.getElementById('notimage').classList.add("hidden");
            // Thumbnail Preview
            document.getElementById('file-image').classList.remove("hidden");
            document.getElementById('file-image').src = URL.createObjectURL(file);
        }
        else {
            document.getElementById('file-image').classList.add("hidden");
            document.getElementById('notimage').classList.remove("hidden");
            document.getElementById('start').classList.remove("hidden");
            document.getElementById('response').classList.add("hidden");
            document.getElementById("file-upload-form").reset();
        }

    }

    function setProgressMaxValue(e) {
        var pBar = document.getElementById('file-progress');
        if (e.lengthComputable) {
            pBar.max = e.total;
        }
    }

    function updateFileProgress(e) {
        var pBar = document.getElementById('file-progress');
        if (e.lengthComputable) {
            pBar.value = e.loaded;
        }
    }

    function uploadFile(file) {
        console.log('uploadFile');
        var xhr = new XMLHttpRequest(),
            fileInput = document.getElementById('file-upload'),
            pBar = document.getElementById('file-progress'),
            fileSizeLimit = 5; // In MB
        if (xhr.upload) {
            // Check if file is less than x MB
            if (file.size <= fileSizeLimit * 1024 * 1024) {
                // Progress bar
                pBar.style.display = 'inline';
                xhr.upload.addEventListener('loadstart', setProgressMaxValue, false);
                xhr.upload.addEventListener('progress', updateFileProgress, false);
                var formData = new FormData();
                formData.append('smfile', fileInput.files[0]);
                formData.append('format', 'json');
                // Start upload
                xhr.open('POST', URL_UPLOAD, true);
                xhr.setRequestHeader('Authorization', API_TOKEN);
                xhr.send(formData);
                xhr.onload = function(e) {
                    var res = xhr.response; // not responseText
                    let resData = JSON.parse(res);
                    let imgURL = '';
                    if (resData.success) {
                        imgURL = resData.data.url;
                    } else if (!resData.success) {
                        if (resData.code = 'image_repeated') {
                            imgURL = resData.images;
                        }
                    }
                    console.log(imgURL);
                }
            } else {
                output('Please upload a smaller file (< ' + fileSizeLimit + ' MB).');
            }
        }
    }
    Init();
})();