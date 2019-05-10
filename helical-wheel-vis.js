// URL: https://observablehq.com/@smsaladi/helical-wheel-visualization-wip-2019_06_06
// Title: Helical Wheel Visualization (WIP 2019_05_07)
// Author: Shyam Saladi (@smsaladi)
// Version: 1271
// Runtime version: 1

const m0 = {
  id: "5e062bfabc2ed876@1271",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`# Helical Wheel Visualization (WIP 2019_05_07)`
)})
    },
    {
      name: "viewof inputAngle",
      inputs: ["text"],
      value: (function(text){return(
text({
      title: "Angle of Separation",
      placeholder: "100",
      value: 100,
      submit: "Go",
      description: "Insert an angle of separation between amino acids. Default value is 100 degrees."
})
)})
    },
    {
      name: "inputAngle",
      inputs: ["Generators","viewof inputAngle"],
      value: (G, _) => G.input(_)
    },
    {
      name: "viewof inputText",
      inputs: ["text"],
      value: (function(text){return(
text({
      title: "Input String",
      value: "ACDEFGHIKLMNPQRSTV",
      placeholder: "ACDEFGH"
})
)})
    },
    {
      name: "inputText",
      inputs: ["Generators","viewof inputText"],
      value: (G, _) => G.input(_)
    },
    {

    },
    {
      inputs: ["DOM","rasterize","chart"],
      value: (function(DOM,rasterize,chart){return(
DOM.download(() => rasterize(chart), undefined, "Save as PNG")
)})
    },
    {
      inputs: ["DOM","serialize","chart"],
      value: (function(DOM,serialize,chart){return(
DOM.download(() => serialize(chart), undefined, "Save as SVG")
)})
    },
    {
      name: "chart",
      inputs: ["globals","math","inputAngle","d3","DOM","fields"],
      value: (function(globals,math,inputAngle,d3,DOM,fields)
{ 
  // Mess with globals?
  const gvar = globals[0];
  const gWidth = gvar["width"];
  const gHeight = gvar["height"];
  const gAngle = gvar["angle"];
  const gRadius = gvar["radius"];
  const gColors = gvar["colors"];
  const termDist = gvar["termDist"];
  const gCircleSep = gvar["circleSep"];
  const maxDotRadius = gvar["maxDotRadius"];
  const minDotRadius = gvar["minDotRadius"];
  const maxStroke = gvar["maxStroke"];
  const minStroke = gvar["minStroke"];
  
  // Number of residues (i.e. circles) all the way around, i.e. 360 degrees
  // `math` is from math.js library
  const circlesPerRound = math.lcm(inputAngle, 360) / inputAngle;
  // Number of residues past the first, e.g. 4 for an alpha helix
  const circlesPerTurn = Math.ceil(360 / inputAngle);
  
  const svg = d3.select(DOM.svg(gWidth, gHeight))
      .attr("text-anchor", "middle")
      .style("display", "block")
      .style("font", "700 14px 'Helvetica Neue'")
      .style("width", "50%")
      .style("max-width", `${window.screen.height}px`)
      .style("height", "auto")
      .style("margin", "auto");
  
  const field = svg.append("g")
      .attr("transform", `translate(${gWidth / 2}, ${gHeight / 2})`) // Center in viewport
      .selectAll("g")
      .data(fields)
      .join("g");
  
  // create the points we're going to draw circles on
  const fieldTick = field.selectAll("g")
      .data(d => d.string.toUpperCase().split("").map((c, i) => ({c: c, i: i, params: d})))
      .join("g")
        .attr("transform", d => {
          const angleRad = (d.i * gAngle % 360) * Math.PI / 180;
          const radiusAdj = d.params.radius + gCircleSep * Math.floor(d.i / circlesPerRound);
          d.x = Math.cos(angleRad) * radiusAdj;
          d.y = Math.sin(angleRad) * radiusAdj;
          return `translate(${d.x}, ${d.y})`; // Center for each circle to be drawn
        });
   
  // Size to decrease each turn
  const pctRadius = (maxDotRadius - minDotRadius) / (circlesPerRound / circlesPerTurn);  
  // Add circles around the wheel
  fieldTick.append("circle")
      .attr("r", (d, i) => {
        if (i < circlesPerRound)
          d.circleRadius = maxDotRadius - Math.floor(i / circlesPerTurn) * pctRadius;
        else
          d.circleRadius = minDotRadius;
        return d.circleRadius;
      })
      .attr("fill", d => gColors[d.c])
      .attr("stroke", "black")
      .attr("stroke-width", 1);
    
  // Function to draw a path between pairs of x,y coords
  var lineFunction = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinear);

  // Accumulate pairs of x,y coordinates for drawing paths
  fieldTick.data()
    .forEach(function(obj, i, arr) {
      const d = arr[i], d_next = arr[i + 1];
      if (typeof d_next !== 'undefined')
        arr[i].linePoints = [{x: d.x, y: d.y}, {x: d_next.x, y: d_next.y}];
    });
  
  // Stroke to decrease per segment
  const pctStroke = (maxStroke - minStroke) / circlesPerRound;
  
  // Add the paths between each pair
  // stroke-width shrinks linearly as residue index increases
  field.selectAll('path')
     .data(fieldTick.data().slice(0, -1))    // Last element doesn't connect to a "next" circle
     .join('path')
     .attr('d', d => lineFunction(d.linePoints))
     .attr('stroke-width', d => Math.max(maxStroke - pctStroke * d.i, minStroke))
     .attr('stroke', "black")
     .lower();
  

  // Add labels inside each circle
  fieldTick.append("text")
        .attr("text-anchor", "middle")        // These 2 lines center
        .attr("dominant-baseline", "central") // text in the circle
        .text(d => d.i + 1);
    
  // Add amino acids labels outside
  fieldTick.append("text")
        .attr("dx", d => -d.circleRadius - termDist)
        .attr("dy", d => -d.circleRadius - termDist)
        .text(d => d.c);

  // Add labels for the N and C termini in red
  fieldTick
    .append('text')
    .attr("dx", d => d.circleRadius + termDist)
    .attr("dy", d => d.circleRadius + termDist)
    .text((d, i) => {
      if (i == 0)
        return "N";
      else if (i == fieldTick.data().length - 1)
        return "C";
    })
    .attr("fill", "red")
    .lower();
    
  // Draw arc for hydrophobic face 
  var arc = d3.arc()
    .innerRadius(fields[0].radius * 1.3)
    .outerRadius(fields[0].radius * 1.3)
    .startAngle(Math.PI/2 - 2 * Math.PI/9) // start 0-indexed
    .endAngle(Math.PI/2 - 4 * Math.PI/9);  // end   0-indexed

  
  svg.append("svg:defs").append("svg:marker")
    .attr("id", "circlehead")
    .attr("refX", 0)
    .attr("refY", 0)
    .attr('viewBox', '-6 -6 12 12')
    .attr("markerWidth", 15)
    .attr("markerHeight", 15)
    .attr('markerUnits', 'userSpaceOnUse')
    .attr("orient", "auto")
    .append("path")       // ↓ from http://bl.ocks.org/dustinlarimer/5888271
    .attr("d", "M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0")
    .style("fill", "#bbb");

  field.append("path")
    .attr("d", arc)
    .style("fill", "none")
    .attr("marker-start", "url(#circlehead)")
    .attr("marker-end", "url(#circlehead)")
    .style("stroke", "#bbb")
    .style("stroke-width", 3)
    .style("stroke-dasharray", "4,8");
  
  // Draw arrow for hydrophobic moment
  svg.append("svg:defs").append("svg:marker")
    .attr("id", "arrowhead")
    .attr("refX", 3)
    .attr("refY", 3)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto")
    .append("path")
    // .attr("d", "M 0 0 12 6 0 12 3 6")
    .attr("d", "M 0 0 6 3 0 6 1.5 3")   // Dimensions of Arrowhead
    .style("fill", "#bbb");
  
  field.append("line")
    .attr("x1", 0)  
    .attr("y1", 0)  
    .attr("x2", 50)  
    .attr("y2", 50)  
    .attr("stroke", "#bbb")  
    .attr("stroke-width", 3)  
    .attr("marker-end", "url(#arrowhead)")
    .attr("transform", `rotate(100)`);
  
  function dist(x1, y1, x0, y0) {
    return Math.sqrt((x1 - x0)**2 + (y1 - y0)**2);
  }
  
  function vertexAngle(a, b, v) {
    var a_dist = dist(b[0], b[1], v[0], v[1]);
    var b_dist = dist(a[0], a[1], v[0], v[1]);
    var c_dist = dist(a[0], a[1], b[0], b[1]);
    
    var numer = a_dist**2 + b_dist**2 - c_dist**2;
    var denom = 2 * a_dist * b_dist;
    
    console.log([numer, denom, Math.acos(numer / denom)]);
    
    return Math.acos(numer / denom) * 180 / Math.PI;
  }
  
  
  // Rotate helical wheel on demand
  var dragHandler = d3.drag()
    .subject(function(d) {
      // Get initial position of viewport
      const x_0 = svg.selectAll("g")
        .attr("transform")
        .match(/\d+/g)
        .map(Number);
      console.log(svg.selectAll("g")
        .attr("transform"));
      
      // Add initial rotation, if any
      var theta = svg.attr("transform");
      theta = theta === null ? 0 : Number(theta.split(/[\(\)]/)[1]);

      // Fix d at initial click
      return d != null ? d : {x: d3.event.x, y: d3.event.y, theta_0: theta, x_0: x_0};
    })
    .on("drag", function () {
      var x_new = [d3.event.x, d3.event.y];
      var x_init = [d3.event.subject.x, d3.event.subject.y];
      var x_0 = d3.event.subject.x_0;
      var newAngle = -vertexAngle(x_new, x_init, x_0) * 3 +
          d3.event.subject.theta_0;
      
      console.log([x_new, x_init, x_0, vertexAngle(x_new, x_init, x_0), newAngle]);
      
      // Rotate everything using the newly calculated angle
      svg.attr("transform", `rotate(${newAngle})`);
      

    });
  dragHandler(svg);
  
  return svg.node();
}
)
    },
    {
      name: "fields",
      inputs: ["globals","inputText"],
      value: (function(globals,inputText){return(
[{radius: 0.7 * globals[0]["radius"],
           string: inputText,
           dotRadius: globals[0]["radius"] / 15,
          }]
)})
    },
    {
      name: "globals",
      inputs: ["inputAngle"],
      value: (function(inputAngle){return(
[{width: 600,
            height: 600,
            radius: 250,
            maxDotRadius: 250 / 15,
            minDotRadius: 250 / 25,
            termDist: 2,
            circleSep: 50,
            angle: inputAngle,
            maxStroke: 2,
            minStroke: 0.1,
            // Shapely colors (not colorblind friendly)
            // http://life.nthu.edu.tw/~fmhsu/rasframe/SHAPELY.HTM
            colors: {
                "D": "#E60A0A", "E": "#E60A0A",
                "C": "#E6E600", "M": "#E6E600",
                "K": "#145AFF", "R": "#145AFF",
                "S": "#FA9600", "T": "#FA9600",
                "F": "#3232AA", "Y": "#3232AA",
                "N": "#00DCDC", "Q": "#00DCDC",
                "G": "#EBEBEB",
                "L": "#0F820F", "V": "#0F820F", "I": "#0F820F",
                "A": "#C8C8C8",
                "W": "#B45AB4",
                "H": "#8282D2",
                "P": "#DC9682"
            }
           }]
)})
    },
    {
      name: "d3",
      inputs: ["require"],
      value: (function(require){return(
require("d3@5")
)})
    },
    {
      from: "@jashkenas/inputs",
      name: "text",
      remote: "text"
    },
    {
      from: "@mbostock/saving-svg",
      name: "rasterize",
      remote: "rasterize"
    },
    {
      from: "@mbostock/saving-svg",
      name: "serialize",
      remote: "serialize"
    },
    {
      name: "math",
      inputs: ["require"],
      value: (function(require){return(
require("https://cdnjs.cloudflare.com/ajax/libs/mathjs/5.4.0/math.js")
)})
    }
  ]
};

const m1 = {
  id: "@jashkenas/inputs",
  variables: [
    {
      name: "text",
      inputs: ["input"],
      value: (function(input){return(
function text(config = {}) {
  const {
    value,
    title,
    description,
    autocomplete = "off",
    maxlength,
    minlength,
    pattern,
    placeholder,
    size,
    submit
  } = config;
  if (typeof config == "string") value = config;
  const form = input({
    type: "text",
    title,
    description,
    submit,
    attributes: {
      value,
      autocomplete,
      maxlength,
      minlength,
      pattern,
      placeholder,
      size
    }
  });
  form.output.remove();
  form.input.style.fontSize = "1em";
  return form;
}
)})
    },
    {
      name: "input",
      inputs: ["html","d3format"],
      value: (function(html,d3format){return(
function input(config) {
  let {
    form,
    type = "text",
    attributes = {},
    action,
    getValue,
    title,
    description,
    format,
    display,
    submit,
    options
  } = config;
  const wrapper = html`<div></div>`;
  if (!form)
    form = html`<form>
	<input name=input type=${type} />
  </form>`;
  Object.keys(attributes).forEach(key => {
    const val = attributes[key];
    if (val != null) form.input.setAttribute(key, val);
  });
  if (submit)
    form.append(
      html`<input name=submit type=submit style="margin: 0 0.75em" value="${
        typeof submit == "string" ? submit : "Submit"
      }" />`
    );
  form.append(
    html`<output name=output style="font: 14px Menlo, Consolas, monospace; margin-left: 0.5em;"></output>`
  );
  if (title)
    form.prepend(
      html`<div style="font: 700 0.9rem sans-serif;">${title}</div>`
    );
  if (description)
    form.append(
      html`<div style="font-size: 0.85rem; font-style: italic;">${description}</div>`
    );
  if (format) format = typeof format === "function" ? format : d3format.format(format);
  if (action) {
    action(form);
  } else {
    const verb = submit
      ? "onsubmit"
      : type == "button"
      ? "onclick"
      : type == "checkbox" || type == "radio"
      ? "onchange"
      : "oninput";
    form[verb] = e => {
      e && e.preventDefault();
      const value = getValue ? getValue(form.input) : form.input.value;
      if (form.output) {
        const out = display ? display(value) : format ? format(value) : value;
        if (out instanceof window.Element) {
          while (form.output.hasChildNodes()) {
            form.output.removeChild(form.output.lastChild);
          }
          form.output.append(out);
        } else {
          form.output.value = out;
        }
      }
      form.value = value;
      if (verb !== "oninput")
        form.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    };
    if (verb !== "oninput")
      wrapper.oninput = e => e && e.stopPropagation() && e.preventDefault();
    if (verb !== "onsubmit") form.onsubmit = e => e && e.preventDefault();
    form[verb]();
  }
  while (form.childNodes.length) {
    wrapper.appendChild(form.childNodes[0]);
  }
  form.append(wrapper);
  return form;
}
)})
    },
    {
      name: "d3format",
      inputs: ["require"],
      value: (function(require){return(
require("d3-format@1")
)})
    }
  ]
};

const m2 = {
  id: "@mbostock/saving-svg",
  variables: [
    {
      name: "rasterize",
      inputs: ["DOM","serialize"],
      value: (function(DOM,serialize){return(
function rasterize(svg) {
  let resolve, reject;
  const promise = new Promise((y, n) => (resolve = y, reject = n));
  const image = new Image;
  image.onerror = reject;
  image.onload = () => {
    const rect = svg.getBoundingClientRect();
    const context = DOM.context2d(rect.width, rect.height);
    context.drawImage(image, 0, 0, rect.width, rect.height);
    context.canvas.toBlob(resolve);
  };
  image.src = URL.createObjectURL(serialize(svg));
  return promise;
}
)})
    },
    {
      name: "serialize",
      inputs: ["NodeFilter"],
      value: (function(NodeFilter)
{
  const xmlns = "http://www.w3.org/2000/xmlns/";
  const xlinkns = "http://www.w3.org/1999/xlink";
  const svgns = "http://www.w3.org/2000/svg";
  return function serialize(svg) {
    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT, null, false);
    while (walker.nextNode()) {
      for (const attr of walker.currentNode.attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, "#");
        }
      }
    }
    svg.setAttributeNS(xmlns, "xmlns", svgns);
    svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer;
    const string = serializer.serializeToString(svg);
    return new Blob([string], {type: "image/svg+xml"});
  };
}
)
    },
    {
      name: "serialize",
      inputs: ["NodeFilter"],
      value: (function(NodeFilter)
{
  const xmlns = "http://www.w3.org/2000/xmlns/";
  const xlinkns = "http://www.w3.org/1999/xlink";
  const svgns = "http://www.w3.org/2000/svg";
  return function serialize(svg) {
    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT, null, false);
    while (walker.nextNode()) {
      for (const attr of walker.currentNode.attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, "#");
        }
      }
    }
    svg.setAttributeNS(xmlns, "xmlns", svgns);
    svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer;
    const string = serializer.serializeToString(svg);
    return new Blob([string], {type: "image/svg+xml"});
  };
}
)
    }
  ]
};

const notebook = {
  id: "5e062bfabc2ed876@1271",
  modules: [m0,m1,m2]
};

export default notebook;
