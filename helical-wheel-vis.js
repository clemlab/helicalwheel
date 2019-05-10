// URL: https://observablehq.com/@tinaswang/helical-wheel-visualization-wip-2019_04_29
// Title: Helical Wheel Visualization (WIP 2019_04_29)
// Author: Tina Wang (@tinaswang)
// Version: 772
// Runtime version: 1

const m0 = {
  id: "308022ae82731b24@772",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`# Helical Wheel Visualization (WIP 2019_04_29)`
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
      value: "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ",
      placeholder: "ABCD"
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
      name: "chart",
      inputs: ["globals","d3","DOM","fields"],
      value: (function(globals,d3,DOM,fields)
{ 
  // Mess with globals?
  const gvar = globals[0];
  const gWidth = gvar["width"];
  const gHeight = gvar["height"];
  const gAngle = gvar["angle"];
  const gRadius = gvar["radius"];
  const gColors = gvar["colors"];
  const termDistX = gvar["termDistX"];
  const termDistY = gvar["termDistY"];
  const gCircleSep = gvar["circleSep"];
  const gDotRadius = gvar["dotRadius"]
  // I want to mathematically calculate the num of maxCircles instead of just declaring it 18?
  const maxCircles = 18;
  
  const svg = d3.select(DOM.svg(gWidth, gHeight))
      .attr("text-anchor", "middle")
      .style("display", "block")
      .style("font", "700 14px 'Helvetica Neue'")
      .style("width", "50%")
      .style("max-width", `${window.screen.height}px`)
      .style("height", "auto")
      .style("margin", "auto");
  
  // group together all elements we draw
  var group = svg.append("g");
  
 
  const field = group
      .attr("transform", `translate(${gWidth / 2},${gHeight / 2})`)
      .selectAll("g")
      .data(fields)
      .enter().append("g");

  
  // create the points we're going to graph circles on
  const fieldTick = field.selectAll("g")
      .data(d => {
        return d.string.split("").map((c, i) => ({c: c, i: i, params: d}));
      })
      .enter().append("g")
      .attr("class", "field-tick")
      .attr("transform", d => {
        const c = d.c;
        const anglerad = (d.i * gAngle % 360) * Math.PI / 180;
        
        // Should make 18 a constant of some sort - magic number bad 
        d.x = Math.cos(anglerad) * (d.params.radius + (gCircleSep * Math.floor(d.i / maxCircles)));
        d.y = Math.sin(anglerad) * (d.params.radius + (gCircleSep * Math.floor(d.i / maxCircles)));
        // Calculate the previous points
        if (d.i !== 0) { 
          const prev = d.i - 1;
          const prevAngle = (prev * gAngle % 360) * Math.PI / 180;
          const prev_x = Math.cos(prevAngle) * (d.params.radius + (gCircleSep * Math.floor(prev / maxCircles)));
          const prev_y = Math.sin(prevAngle) * (d.params.radius + (gCircleSep * Math.floor(prev / maxCircles)));
          d.linePoints = [{x : prev_x, y : prev_y}, {x: d.x, y: d.y}]
        }
         // Store the endpoints in a format where we can access it later
        else {
          d.linePoints = [{x : d.x, y : d.y}, {x: d.x, y: d.y}]
        }

        return `translate(${d.x}, ${d.y})`;
      });
  

  // Add circles around the wheel
  fieldTick.append("circle")
      .attr("r", d => {
        return gDotRadius;
      })
      .attr("fill", d => {
        return gColors[d.c];
      })
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  
  
  // Create paths between the circles
  var lineFunction = d3.line()
  .x(function(d) { return d.x; })
  .y(function(d) { return d.y; })
 .curve(d3.curveLinear);


  // Add the paths between each pair; our stroke-width grows as the number of residues increases
  field.selectAll('path')
     .data(fieldTick.data())
     .enter().append('path')
     .attr('d', function(d) { return lineFunction(d.linePoints); } )
     .attr('stroke-width', function(d) { return d.i / 10; })
     .attr('stroke', "black").lower();

  
  
  
  // Add labels inside each circle
  fieldTick.append("text")
        .attr("text-anchor", "middle")        // These lines center
        .attr("dominant-baseline", "central") // text in the circle
        .text(d => d.i + 1);
  
    // Add amino acids labels outside
    fieldTick.append("text")
        .attr("dx", function(d) {return -termDistX; })
        .attr("dy", function(d) {return -termDistY; })
        .text(d => d.c);
  
  // Add labels for the N and C terminuses in red
  if (fieldTick.data().length > 0) {
    field.append("text")
          .attr("x", fieldTick.data()[0].x + termDistX)
          .attr("y",fieldTick.data()[0].y + termDistY)
          .text("N")
         .attr("fill", "red");
  }
  
   // Add labels for the N and C terminuses
  if (fieldTick.data().length > 1) {
    field.append("text")
          .attr("x", fieldTick.data()[fieldTick.data().length - 1].x + termDistX)
          .attr("y",fieldTick.data()[fieldTick.data().length - 1].y + termDistY)
          .text("C")
         .attr("fill", "red");
  }
  
   // handle rotation drag
   group.call(d3.drag()
        
        .on("drag", dragged)
        );

    // Function that moves the helical wheel 
    // Calculations for angle from http://bl.ocks.org/tomgp/f39ccb9d4c17ced4e3d2
    function dragged(d) {
      d3.select(this).classed('active',true);
      var x = d3.event.x - gRadius;
      var y = d3.event.y - gRadius;
        var newAngle = Math.atan2(y , x) * 57.2957795;
        if (newAngle < 0) {
          newAngle = 360 + newAngle;
        }
        // Rotate everything using the newly calculated angle and centered on the center of the circle
        group.attr("transform","translate(" + gWidth / 2 + ", " + gHeight / 2 + 
                          ") rotate(" + newAngle +")" )
    }

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
            dotRadius: 250 / 15,
            termDistX: 20,
            termDistY: 20,
            circleSep: 50,
            angle: inputAngle,
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
                "L": "#0F820F", "V": "#0F820F", "I": "0F820F",
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
    }
  ]
};

const notebook = {
  id: "308022ae82731b24@772",
  modules: [m0,m1,m2]
};

export default notebook;
