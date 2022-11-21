let diameter = 40;
let fontSize = 25;
let MSTEdgeWeight = 10;
let MSTEdgeColor = "red";
let MSTVertexColor = "blue";

let mouseIsDragged = false;
let currentVertex = null;
let PrimIsRunning = false;
let buttonSelectStartVertex;
let selectingStartVertex = false;
let selectedStartVertex = null;
let KruskalIsRunning = false;
let buttonStartKruskal;
let speedMS;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let buttonAddVertex;
let buttonAddEdge;
let buttonShowHideId;
let buttonResetGraph;
let buttonSelectVertexA;
let buttonSelectVertexB;
let selectedVertexA = null;
let selectedVertexB = null;
let selectingVertexA = false;
let selectingVertexB = false;
let weightInput;
let buttonSave;
let buttonImport;
let buttonImport1;
let buttonImport2;
let inputTextArea;

const graph = new Graph(diameter, fontSize);
function setup() {
  width = windowWidth - 70;
  height = windowHeight + 20;
  //createCanvas(width, height);
  var canvas = createCanvas(width, height);
  canvas.position(30, 4880);
  canvas.elt.style.border = "2px solid blue";

  const posY = 4880; //Pos of canvas
  const lineHeight = 40;
  let line = 1;
  const x = 45; //pos of button (ex: buttonAddVertex)

  buttonAddVertex = createButton("Thêm đỉnh");
  buttonAddVertex.position(x, posY + lineHeight * line++);
  buttonAddVertex.mousePressed(addVertex);

  // buttonShowHideId = createButton("Show Hide Id");
  // buttonShowHideId.position(x, posY + lineHeight * line++);
  // buttonShowHideId.mousePressed(showHideId);

  buttonSelectVertexA = createButton("Chọn Đỉnh 1: ?");
  buttonSelectVertexA.id("buttonSelectVertexA");
  buttonSelectVertexA.position(x, posY + lineHeight * line++);
  buttonSelectVertexA.mousePressed(selectVertexA);

  let div0 = createDiv("");
  div0.html("Khoảng cách (Trọng số):");
  div0.position(x, posY + lineHeight * line);
  weightInput = createInput("");
  weightInput.size(70);
  weightInput.position(200, posY + lineHeight * line++);

  buttonSelectVertexB = createButton("Chọn Đỉnh 2: ?");
  buttonSelectVertexB.id("buttonSelectVertexB");
  buttonSelectVertexB.position(x, posY + lineHeight * line++);
  buttonSelectVertexB.mousePressed(selectVertexB);

  buttonAddEdge = createButton("Thêm Cạnh");
  buttonAddEdge.position(x, posY + lineHeight * line++);
  buttonAddEdge.mousePressed(addEdge);

  // line++;
  let div = createDiv("");
  div.html("Tốc độ (ms):", true);
  div.position(x, posY + lineHeight * line);
  speedMS = createInput("1000");
  speedMS.size(40);
  speedMS.position(140, posY + lineHeight * line++);

  buttonSelectStartVertex = createButton("Prim's Algorithm: chọn Đỉnh bắt đầu");
  buttonSelectStartVertex.id("buttonSelectStartVertex");
  buttonSelectStartVertex.position(x, posY + lineHeight * line++);
  buttonSelectStartVertex.mousePressed(selectStartVertex);

  buttonStartKruskal = createButton("Kruskal's Algorithm");
  buttonStartKruskal.id("buttonStartKruskal");
  buttonStartKruskal.position(x, posY + lineHeight * line++);
  buttonStartKruskal.mousePressed(startKruskal);

  // buttonStartKruskal = createButton("Start Dijkstra's Algorithm");
  // buttonStartKruskal.id("buttonStartKruskal");
  // buttonStartKruskal.position(x, posY + lineHeight * line++);
  // buttonStartKruskal.mousePressed(startKruskal);

  buttonResetGraph = createButton("Reset Graph");
  buttonResetGraph.position(x, posY + lineHeight * line++);
  buttonResetGraph.mousePressed(resetGraph);

  buttonResetGraph = createButton("Delete Graph");
  buttonResetGraph.position(x, posY + lineHeight * line++);
  buttonResetGraph.mousePressed(deleteGraph);

  line++;
  buttonSave = createButton("Save Image");
  buttonSave.position(x, posY + lineHeight * line);
  buttonSave.mousePressed(saveImage);

  buttonImport = createButton("Import Graph");
  buttonImport.position(140, posY + lineHeight * line++);
  buttonImport.mousePressed(importGraph);

  buttonImport = createButton("Import Graph 1");
  buttonImport.position(140, posY + lineHeight * line++);
  buttonImport.mousePressed(importGraph1);

  buttonImport = createButton("Import Graph 2");
  buttonImport.position(140, posY + lineHeight * line++);
  buttonImport.mousePressed(importGraph2);

  inputTextArea = createElement("TextArea");
  inputTextArea.id("inputTextArea");
  inputTextArea.position(x, posY + lineHeight * line++);
  inputTextArea.size(200, 200);
  document.getElementById("inputTextArea").innerText = "";
}

function draw() {
  background(150, 250, 250);
  stroke(0, 0, 255);
  // line(250, 0, 250, 900);
  graph.draw();
  noLoop();
}

function addVertex() {
  graph.addVertex();
  loop();
}

function addEdge() {
  if (
    selectedVertexA &&
    selectedVertexB &&
    selectedVertexA.id !== selectedVertexB.id &&
    +weightInput.value() >= 0
  ) {
    graph.connect(
      selectedVertexA.id,
      selectedVertexB.id,
      +weightInput.value(),
      "white",
      "blue",
      "white",
      "blue",
      "black",
      1
    );
    selectingVertexA = false;
    selectingVertexB = false;
    document.getElementById("buttonSelectVertexA").style.background = "white";
    document.getElementById("buttonSelectVertexB").style.background = "white";
    document.getElementById("buttonSelectVertexA").innerText = "Click Vertex 1";
    document.getElementById("buttonSelectVertexB").innerText = "Click Vertex2";
    loop();
  }
}

function selectStartVertex() {
  selectingStartVertex = true;
  KruskalIsRunning = false;
  selectingVertexA = false;
  selectingVertexB = false;
  document.getElementById("buttonSelectStartVertex").style.background =
    "yellow";
  document.getElementById("buttonSelectVertexA").innerText = "Chọn Vertex 1: ?";
  document.getElementById("buttonSelectVertexB").innerText = "Chọn Vertex 2: ?";
  document.getElementById("buttonSelectVertexA").style.background = "white";
  document.getElementById("buttonSelectVertexB").style.background = "white";
}

//----------------------ALGORITHM---------------------
// ----------------------------------------------------

//---------------PRIM----------------
async function PrimMST() {
  if (!selectedStartVertex) return; //Chọn đỉnh bắt đầu

  resetGraph(); //Reset màu
  loop();

  let MSTEdges = [];
  let neighborhood = [];
  for (let edge of selectedStartVertex.edges) {
    neighborhood.push(edge); //push các cạnh kề
    graph.connect(
      edge.vertexA.id,
      edge.vertexB.id,
      edge.weight,
      "white",
      "magenta",
      "white",
      "magenta",
      "magenta",
      MSTEdgeWeight / 2
    );
  }
  //sort tìm cạnh có trọng số nhỏ nhất
  neighborhood.sort(function (a, b) {
    return +b.weight - +a.weight;
  });
  let t = 0;
  while (
    MSTEdges.length < graph.vertices.length &&
    neighborhood.length > 0 &&
    t++ < 100
  ) {
    let newEdge = neighborhood.pop(); //lấy ra cạnh có trọng số nhỏ nhất
    MSTEdges.push(newEdge);

    graph.connect(
      newEdge.vertexA.id,
      newEdge.vertexB.id,
      newEdge.weight,
      "white",
      MSTVertexColor,
      "white",
      MSTVertexColor,
      MSTEdgeColor,
      MSTEdgeWeight
    );
    //Xét 2 đỉnh và set đã visited(true)
    newEdge.vertexA.mst = true;
    newEdge.vertexB.mst = true;
    loop();
    await delay(speedMS.value());
    for (let edge of newEdge.vertexB.edges) {
      if (!edge.vertexB.mst) {
        //Xét đỉnh tiếp theo (chưa được duyệt qua và hiển thị các cạnh liên kết)
        graph.connect(
          edge.vertexA.id,
          edge.vertexB.id,
          edge.weight,
          edge.vertexA.color,
          edge.vertexA.background,
          "white",
          "magenta",
          "magenta",
          MSTEdgeWeight / 2
        );
        neighborhood.push(edge);
      }
    }
    neighborhood.sort(function (a, b) {
      return +b.weight - +a.weight;
    });
    //Lọc ra những cạnh đã có đỉnh được xét duyệt qua
    neighborhood = neighborhood.filter((edge) => {
      if (edge.vertexA.mst && edge.vertexB.mst) {
        graph.connect(
          edge.vertexA.id,
          edge.vertexB.id,
          edge.weight,
          edge.vertexA.color,
          edge.vertexA.background,
          edge.vertexB.color,
          edge.vertexB.background,
          "gray",
          0.4
        );
      }
      return !edge.vertexA.mst || !edge.vertexB.mst;
    });
    //Xét cạnh nhỏ nhất để vẽ màu xanh in cây khung
    if (neighborhood.length > 0) {
      const edge = neighborhood[neighborhood.length - 1];
      graph.connect(
        edge.vertexA.id,
        edge.vertexB.id,
        edge.weight,
        edge.vertexA.color,
        edge.vertexA.background,
        edge.vertexB.color,
        edge.vertexB.background,
        "green",
        MSTEdgeWeight
      );
      loop();
      await delay(speedMS.value());
    }
  }
  loop();

  //In kết quả
  let mst = [];
  let totalWeight = 0;
  const cmtBlock = document.querySelector("#cmt-block");
  //console.log("Prim's Algorithm: MSTEdges", MSTEdges);
  var results = "";
  results += `<span>Prim's Algorithm:</span>`;
  for (let edge of MSTEdges) {
    totalWeight += edge.weight;
    // console.log(
    // 	edge.vertexA.name + ' to ' + edge.vertexB.name + ': ' + edge.weight
    // );
    results += `<ul> 
				<li> ${edge.vertexA.name} to ${edge.vertexB.name}: ${edge.weight}</li>
			 </ul>`;
  }
  results += `<span>Prim's Algorithm: Total weight = ${totalWeight} </span>`;
  cmtBlock.innerHTML = results;

  // console.log("Prim's Algorithm: Total weight = " + totalWeight);
  PrimIsRunning = false;
  selectingStartVertex = false;
  document.getElementById("buttonSelectStartVertex").innerText =
    "Prim's Algorithm: chọn Start Vertex";
  document.getElementById("buttonSelectStartVertex").style.background = "white";
}

//------------------------------KRUSKAL----------------------
function startKruskal() {
  if (PrimIsRunning) return;
  KruskalIsRunning = true;
  PrimIsRunning = false;
  selectingVertexA = false;
  selectingVertexB = false;
  document.getElementById("buttonStartKruskal").style.background = "yellow";
  document.getElementById("buttonSelectVertexA").innerText = "Chọn Vertex 1: ?";
  document.getElementById("buttonSelectVertexB").innerText = "Chọn Vertex 2: ?";
  document.getElementById("buttonSelectVertexA").style.background = "white";
  document.getElementById("buttonSelectVertexB").style.background = "white";

  KruskalMST();
}

async function KruskalMST() {
  if (graph.length === 0) return;

  resetGraph();
  loop();

  let edges = [];
  for (let vertex of graph.vertices) {
    for (let edge of vertex.edges) {
      if (
        edges.filter(
          (e) =>
            e.vertexA.id === edge.vertexB.id && e.vertexB.id === edge.vertexA.id
        ).length === 0
      ) {
        edges.push(edge);
      }
    }
  }
  edges.sort(function (a, b) {
    return +a.weight - +b.weight;
  });
  // console.log(edges);
  // console.log(edges.pop());

  let MSTEdges = [];
  while (edges.length > 0) {
    const edge = edges.pop();
    // console.log(edge);
    const edgeIsGood = await thereIsNoLoop(edge, MSTEdges);
    if (edgeIsGood) {
      edge.vertexA.mst = true;
      edge.vertexB.mst = true;
      MSTEdges.push(edge);
      graph.connect(
        edge.vertexA.id,
        edge.vertexB.id,
        edge.weight,
        "white",
        MSTVertexColor,
        "white",
        MSTVertexColor,
        MSTEdgeColor,
        MSTEdgeWeight
      );
      loop();
      await delay(speedMS.value());
    }
  }
  //In kết quả
  let totalWeight = 0;
  const cmtBlock = document.querySelector("#cmt-block");
  //console.log("Kruskal's Algorithm: MSTEdges", MSTEdges);
  var results = "";
  results += `<span>Kruskal's Algorithm:</span>`;

  for (let edge of MSTEdges) {
    totalWeight += edge.weight;
    // console.log(
    // 	edge.vertexA.name + ' to ' + edge.vertexB.name + ': ' + edge.weight
    // );
    results += `<ul> 
       <li> ${edge.vertexA.name} to ${edge.vertexB.name}: ${edge.weight}</li>
      </ul>`;
  }
  results += `<span>Kruskal's Algorithm: Total weight = ${totalWeight} </span>`;
  cmtBlock.innerHTML = results;
  //console.log("Kruskal's Algorithm: Total weight = " + totalWeight);
  KruskalIsRunning = false;
  document.getElementById("buttonStartKruskal").style.background = "white";
}

async function thereIsNoLoop(edge, MSTEdges) {
  if (!edge.vertexA.mst || !edge.vertexB.mst) {
    if (edge.vertexA.mst) {
      edge.vertexB.groupId = edge.vertexA.groupId;
    } else if (edge.vertexB.mst) {
      edge.vertexA.groupId = edge.vertexB.groupId;
    } else {
      edge.vertexA.groupId = Vertex.nextGroupId;
      edge.vertexB.groupId = Vertex.nextGroupId;
      Vertex.nextGroupId++;
    }
    return true;
  }
  if (edge.vertexA.groupId === edge.vertexB.groupId) {
    return false;
  }

  const groupBId = edge.vertexB.groupId;
  graph.connect(
    edge.vertexA.id,
    edge.vertexB.id,
    edge.weight,
    "white",
    MSTVertexColor,
    "white",
    MSTVertexColor,
    "green",
    MSTEdgeWeight
  );
  loop();
  await delay(speedMS.value() * 5);

  MSTEdges.forEach((e) => {
    if (e.vertexA.groupId === groupBId) {
      e.vertexA.groupId = edge.vertexA.groupId;
    }
    if (e.vertexB.groupId === groupBId) {
      e.vertexB.groupId = edge.vertexA.groupId;
    }
  });

  return true;
}

function selectVertexA() {
  selectingVertexA = true;
  document.getElementById("buttonSelectVertexA").style.background = "yellow";
  document.getElementById("buttonSelectVertexA").innerText =
    "Click 1 vertex để chọn";
  selectingVertexB = false;
  document.getElementById("buttonSelectVertexB").style.background = "white";
}

function selectVertexB() {
  selectingVertexA = false;
  document.getElementById("buttonSelectVertexA").style.background = "white";
  selectingVertexB = true;
  document.getElementById("buttonSelectVertexB").style.background = "yellow";
  document.getElementById("buttonSelectVertexB").innerText =
    "Click 1 vertex để chọn";
}

function showHideId() {
  Vertex.showHideId();
  loop();
}

function resetGraph() {
  graph.reset();
}

function deleteGraph() {
  graph.clear();
}

function importGraph1() {
  document.getElementById("inputTextArea").innerText =
    '[{"id":0,"name":"A","x":419,"y":182,"edges":[{"vertexBId":1,"weight":5},{"vertexBId":3,"weight":4},{"vertexBId":4,"weight":1}]},{"id":1,"name":"B","x":595,"y":152,"edges":[{"vertexBId":0,"weight":5},{"vertexBId":2,"weight":4},{"vertexBId":3,"weight":2}]},{"id":2,"name":"C","x":731,"y":205,"edges":[{"vertexBId":1,"weight":4},{"vertexBId":9,"weight":2},{"vertexBId":7,"weight":4},{"vertexBId":8,"weight":1}]},{"id":3,"name":"D","x":543,"y":271,"edges":[{"vertexBId":0,"weight":4},{"vertexBId":1,"weight":2},{"vertexBId":4,"weight":2},{"vertexBId":7,"weight":2},{"vertexBId":6,"weight":11},{"vertexBId":5,"weight":5}]},{"id":4,"name":"E","x":390,"y":328,"edges":[{"vertexBId":0,"weight":1},{"vertexBId":3,"weight":2},{"vertexBId":5,"weight":1}]},{"id":5,"name":"F","x":413,"y":450,"edges":[{"vertexBId":3,"weight":5},{"vertexBId":4,"weight":1},{"vertexBId":6,"weight":7}]},{"id":6,"name":"G","x":584,"y":444,"edges":[{"vertexBId":3,"weight":11},{"vertexBId":5,"weight":7},{"vertexBId":8,"weight":4},{"vertexBId":7,"weight":1}]},{"id":7,"name":"H","x":649,"y":321,"edges":[{"vertexBId":2,"weight":4},{"vertexBId":3,"weight":2},{"vertexBId":6,"weight":1},{"vertexBId":8,"weight":6}]},{"id":8,"name":"I","x":737,"y":401,"edges":[{"vertexBId":2,"weight":1},{"vertexBId":6,"weight":4},{"vertexBId":7,"weight":6},{"vertexBId":9,"weight":7}]},{"id":9,"name":"J","x":829,"y":322,"edges":[{"vertexBId":2,"weight":2},{"vertexBId":8,"weight":7}]}]';
  importGraph();
}

function importGraph2() {
  document.getElementById("inputTextArea").innerText =
    '[{"id":0,"name":"A","x":419,"y":182,"edges":[{"vertexBId":1,"weight":5},{"vertexBId":3,"weight":4},{"vertexBId":4,"weight":1}]},{"id":1,"name":"B","x":664,"y":96,"edges":[{"vertexBId":0,"weight":5},{"vertexBId":2,"weight":4},{"vertexBId":3,"weight":2}]},{"id":2,"name":"C","x":910,"y":150,"edges":[{"vertexBId":1,"weight":4},{"vertexBId":9,"weight":2},{"vertexBId":7,"weight":4},{"vertexBId":8,"weight":1}]},{"id":3,"name":"D","x":546,"y":268,"edges":[{"vertexBId":0,"weight":4},{"vertexBId":1,"weight":2},{"vertexBId":4,"weight":2},{"vertexBId":7,"weight":2},{"vertexBId":6,"weight":11},{"vertexBId":5,"weight":5}]},{"id":4,"name":"E","x":390,"y":328,"edges":[{"vertexBId":0,"weight":1},{"vertexBId":3,"weight":2},{"vertexBId":5,"weight":1}]},{"id":5,"name":"F","x":527,"y":590,"edges":[{"vertexBId":3,"weight":5},{"vertexBId":4,"weight":1},{"vertexBId":6,"weight":7}]},{"id":6,"name":"G","x":839,"y":600,"edges":[{"vertexBId":3,"weight":11},{"vertexBId":5,"weight":7},{"vertexBId":8,"weight":4},{"vertexBId":7,"weight":1}]},{"id":7,"name":"H","x":856,"y":344,"edges":[{"vertexBId":2,"weight":4},{"vertexBId":3,"weight":2},{"vertexBId":6,"weight":1},{"vertexBId":8,"weight":6}]},{"id":8,"name":"I","x":1050,"y":515,"edges":[{"vertexBId":2,"weight":1},{"vertexBId":6,"weight":4},{"vertexBId":7,"weight":6},{"vertexBId":9,"weight":7}]},{"id":9,"name":"J","x":1231,"y":92,"edges":[{"vertexBId":2,"weight":2},{"vertexBId":8,"weight":7}]}]  ';
  importGraph();
}

function importGraph() {
  if (KruskalIsRunning) return;
  if (PrimIsRunning) return;
  const data = inputTextArea.value();
  if (data) {
    const obj = JSON.parse(data);
    graph.clear();
    obj.forEach((vertex) => {
      graph.importVertex(new Vertex(vertex.x, vertex.y, diameter, fontSize));
    });
    obj.forEach((vertex) => {
      for (let edge of vertex.edges) {
        graph.connect(
          vertex.id,
          edge.vertexBId,
          edge.weight,
          "blue",
          "white",
          "blue",
          "white",
          "black",
          1
        );
      }
    });
    loop();
  }
  KruskalIsRunning = false;
  currentVertex = null;
}

//Save image với định dạng JSON file
function saveImage() {
  inputTextArea.value(graph.export());
  saveCanvas("MyGraph", "png");
  console.log("save", inputTextArea.value());
  saveStrings(inputTextArea.value().split("\n"), "MyGraph.txt");
}

function findSelectVertex() {
  currentVertex = graph.findSelectedVertex();
  loop();
}

function mousePressed() {
  if (KruskalIsRunning) return;
  if (PrimIsRunning) return;
  mouseIsDragged = false;
  findSelectVertex();
}

function mouseClicked() {
  if (KruskalIsRunning) return;
  if (PrimIsRunning) return;

  mouseIsDragged = false;
  findSelectVertex();
  if (currentVertex) {
    if (selectingVertexA) {
      selectedVertexA = currentVertex;
      document.getElementById("buttonSelectVertexA").innerText =
        "Chọn Vertex 1 => " + selectedVertexA.name;
      document.getElementById("buttonSelectVertexA").style.background = "white";
    } else if (selectingVertexB) {
      selectedVertexB = currentVertex;
      document.getElementById("buttonSelectVertexB").innerText =
        "Chọn Vertex 2 => " + selectedVertexB.name;
      document.getElementById("buttonSelectVertexB").style.background = "white";
    } else if (selectingStartVertex) {
      selectedStartVertex = currentVertex;
      PrimIsRunning = true;
      document.getElementById("buttonSelectStartVertex").innerText =
        "Prim's Algorithm: Start Vertex = " + selectedStartVertex.name;
      document.getElementById("buttonSelectStartVertex").style.background =
        "yellow";
      PrimMST();
    }
  }
}

function mouseDragged() {
  if (KruskalIsRunning) return;
  if (PrimIsRunning) return;
  mouseIsDragged = true;
  if (currentVertex) {
    currentVertex.x = mouseX;
    currentVertex.y = mouseY;
    loop();
  }
  return false;
}

function mouseReleased() {
  if (KruskalIsRunning) return;
  if (PrimIsRunning) return;
  if (mouseIsDragged && currentVertex) {
    currentVertex.x = mouseX;
    currentVertex.y = mouseY;
    currentVertex = null;
    loop();
  }
  mouseIsDragged = false;
  return false;
}
