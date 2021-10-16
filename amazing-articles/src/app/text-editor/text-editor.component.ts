import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements OnInit {
  // @Input('parentData') public content = "";
  @Output() public childEvent = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    // If content is passed from the parent to the child, then display that content
    // console.log("Child component : " + this.content);
    // if(this.content)
    // {
    //   var editableDiv = document.getElementById('texteditor');
    //   editableDiv.innerHTML = this.content;
    // }
    // else display empty content
  }

  // For adding hyperlink
  addLinkFlag = false;
  updateLinkFlag() {
    this.addLinkFlag = !this.addLinkFlag;
  }

  // get text data from editor
  // data = "";
  getTextData() {
    var editableDiv = document.getElementById('texteditor');
    var innerHTML = editableDiv.innerHTML;  // using innerHTML here because it preserves newlines
    // if(innerHTML[innerHTML.length-1] === '\n') 
    //   innerHTML = innerHTML.slice(0,-1);            // get rid of weird extra newline
    // console.log(innerHTML);
    // document.getElementById('content').innerHTML = innerHTML;
    // this.data = innerHTML;
    return innerHTML;
  }

  fireEvent() {
    const content = this.getTextData();
    this.childEvent.emit(content);
  }
}
