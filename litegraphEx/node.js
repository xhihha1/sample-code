//node constructor class
function MyAddNode()
{
  this.addInput("A","number");
  this.addInput("B","number");
  this.addOutput("A+B","number");
  this.properties = { precision: 1 };
}

//name to show
MyAddNode.title = "Sum";

//function to call when the node is executed
MyAddNode.prototype.onExecute = function()
{
  var A = this.getInputData(0);
  if( A === undefined )
    A = 0;
  var B = this.getInputData(1);
  if( B === undefined )
    B = 0;
  this.setOutputData( 0, A + B );
}

//register in the system
LiteGraph.registerNodeType("basic/sum", MyAddNode );

// -----------------------------------------------------------------

function sum(a,b)
{
   return a+b;
}

LiteGraph.wrapFunctionAsNode("math/sum",sum, ["Number","Number"],"Number");



// ------------------
console.log(LGraphCanvas)
LGraphCanvas.prototype.showShowNodePanel = function (node) {
  console.log('???????')
  this.SELECTED_NODE = node;
  this.closePanels();
  var ref_window = this.getCanvasWindow();
      var that = this;
  var graphcanvas = this;
  panel = this.createPanel(node.title || "",{
                                                  closable: true
                                                  ,window: ref_window
                                                  ,onOpen: function(){
                                                      graphcanvas.NODEPANEL_IS_OPEN = true;
                                                  }
                                                  ,onClose: function(){
                                                      graphcanvas.NODEPANEL_IS_OPEN = false;
                                                      graphcanvas.node_panel = null;
                                                  }
                                              });
      graphcanvas.node_panel = panel;
  panel.id = "node-panel";
  panel.node = node;
  panel.classList.add("settings");

  function inner_refresh()
  {
    panel.content.innerHTML = ""; //clear
    panel.addHTML("<span class='node_type'>"+node.type+"</span><span class='node_desc'>"+(node.constructor.desc || "")+"</span><span class='separator'></span>");

    panel.addHTML("<h3>Properties</h3>");

          var fUpdate = function(name,value){
                          graphcanvas.graph.beforeChange(node);
                          switch(name){
                              case "Title":
                                  node.title = value;
                                  break;
                              case "Mode":
                                  var kV = Object.values(LiteGraph.NODE_MODES).indexOf(value);
                                  if (kV>=0 && LiteGraph.NODE_MODES[kV]){
                                      node.changeMode(kV);
                                  }else{
                                      console.warn("unexpected mode: "+value);
                                  }
                                  break;
                              case "Color":
                                  if (LGraphCanvas.node_colors[value]){
                                      node.color = LGraphCanvas.node_colors[value].color;
                                      node.bgcolor = LGraphCanvas.node_colors[value].bgcolor;
                                  }else{
                                      console.warn("unexpected color: "+value);
                                  }
                                  break;
                              default:
                                  node.setProperty(name,value);
                                  break;
                          }
                          graphcanvas.graph.afterChange();
                          graphcanvas.dirty_canvas = true;
                      };
          
          panel.addWidget( "string", "Title", node.title, {}, fUpdate);
          
          panel.addWidget( "combo", "Mode", LiteGraph.NODE_MODES[node.mode], {values: LiteGraph.NODE_MODES}, fUpdate);
          
          var nodeCol = "";
          if (node.color !== undefined){
              nodeCol = Object.keys(LGraphCanvas.node_colors).filter(function(nK){ return LGraphCanvas.node_colors[nK].color == node.color; });
          }
          
          panel.addWidget( "combo", "Color", nodeCol, {values: Object.keys(LGraphCanvas.node_colors)}, fUpdate);
          
          for(var pName in node.properties)
    {
      var value = node.properties[pName];
      var info = node.getPropertyInfo(pName);
      var type = info.type || "string";

      //in case the user wants control over the side panel widget
      if( node.onAddPropertyToPanel && node.onAddPropertyToPanel(pName,panel) )
        continue;

      panel.addWidget( info.widget || info.type, pName, value, info, fUpdate);
    }

    panel.addSeparator();

    if(node.onShowCustomPanelInfo)
      node.onShowCustomPanelInfo(panel);

          panel.footer.innerHTML = ""; // clear
    panel.addButton("Delete",function(){
      if(node.block_delete)
        return;
      node.graph.remove(node);
      panel.close();
    }).classList.add("delete");
  }

  panel.inner_showCodePad = function( propname )
  {
          panel.classList.remove("settings");
          panel.classList.add("centered");

          
    /*if(window.CodeFlask) //disabled for now
    {
      panel.content.innerHTML = "<div class='code'></div>";
      var flask = new CodeFlask( "div.code", { language: 'js' });
      flask.updateCode(node.properties[propname]);
      flask.onUpdate( function(code) {
        node.setProperty(propname, code);
      });
    }
    else
    {*/
      panel.alt_content.innerHTML = "<textarea class='code'></textarea>";
      var textarea = panel.alt_content.querySelector("textarea");
              var fDoneWith = function(){
                  panel.toggleAltContent(false); //if(node_prop_div) node_prop_div.style.display = "block"; // panel.close();
                  panel.toggleFooterVisibility(true);
                  textarea.parentNode.removeChild(textarea);
                  panel.classList.add("settings");
                  panel.classList.remove("centered");
                  inner_refresh();
              }
      textarea.value = node.properties[propname];
      textarea.addEventListener("keydown", function(e){
        if(e.code == "Enter" && e.ctrlKey )
        {
          node.setProperty(propname, textarea.value);
                      fDoneWith();
        }
      });
              panel.toggleAltContent(true);
              panel.toggleFooterVisibility(false);
      textarea.style.height = "calc(100% - 40px)";
    /*}*/
    var assign = panel.addButton( "Assign", function(){
      node.setProperty(propname, textarea.value);
              fDoneWith();
    });
    panel.alt_content.appendChild(assign); //panel.content.appendChild(assign);
    var button = panel.addButton( "Close", fDoneWith);
    button.style.float = "right";
    panel.alt_content.appendChild(button); // panel.content.appendChild(button);
  }

  inner_refresh();

  document.getElementById('propertyArea').appendChild( panel );
  // this.canvas.parentNode.appendChild( panel );
}
