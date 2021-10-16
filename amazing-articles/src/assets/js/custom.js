function loadSelectedImage() {
    var file = document.getElementById('input-tag').files[0];
    // var fileTag = document.getElementById('input-tag');
    var reader = new FileReader();
    if (file && file.type.match('image.*')) 
    {
        reader.readAsDataURL(file);
    } 
    reader.onloadend = function (e) {
        $('#img-tag').attr('src', e.target.result);        
        var image = document.createElement("img");
        image.src = e.target.result;
    }
}