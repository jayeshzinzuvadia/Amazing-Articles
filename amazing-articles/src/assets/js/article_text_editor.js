// window.addEventListener('load', function(){
//     document.getElementById('texteditor').setAttribute('contenteditable', 'true');
// });

/* Using in-built javascript function to handle formatting for us */
function format(command, value) 
{
    document.execCommand(command, false, value);
}

function addEmoji(utfCode)
{
    var selectedText = document.getSelection();
    document.execCommand('insertHTML', false, selectedText + '<span>&#' + utfCode + ';</span>');
}

/*This function is used to set the selected text as URL*/
function setUrl() {
    var url = document.getElementById('txtFormatUrl').value;
    var selectedText = document.getSelection();
    if(url != "")
    {
        document.execCommand('insertHTML', false, '<a href="' + url + '" target="_blank" style="cursor: pointer;" title="'+url+'">' + selectedText + '</a>');
        document.getElementById('txtFormatUrl').value = '';
    }
}