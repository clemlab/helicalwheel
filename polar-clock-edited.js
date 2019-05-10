// URL: https://observablehq.com/@tinaswang/polar-clock-edited
// Title: Helical Wheel Visualization (WIP)
// Author: Tina Wang (@tinaswang)
// Version: 354
// Runtime version: 1

const m0 = {
  id: "931ef38e43d6f38e@354",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`# Helical Wheel Visualization (WIP)`
)})
    },
    {
      name: "viewof inputAngle",
      inputs: ["text"],
      value: (function(text){return(
text({
      title: "Angle of Separation",
      placeholder: "100",
      submit: "Go",
      description: "Insert an angle of separation between amino acids. Default value is 100 degrees."
}
)
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
      placeholder: "ABCD"
}
)
)})
    },
    {
      name: "inputText",
      inputs: ["Generators","viewof inputText"],
      value: (G, _) => G.input(_)
    },
    {
      name: "viewof c1",
      inputs: ["color"],
      value: (function(color){return(
color({
  value: "#0000ff",
  title: "Background Color",
  description: "This color picker starts out blue"
})
)})
    },
    {
      name: "c1",
      inputs: ["Generators","viewof c1"],
      value: (G, _) => G.input(_)
    },
    {
      inputs: ["d3","DOM","width","height","fields","range","circleCount","getAngle","dotRadius"],
      value: (function(d3,DOM,width,height,fields,range,circleCount,getAngle,dotRadius)
{ 
  const svg = d3.select(DOM.svg(width, height))
      .attr("text-anchor", "middle")
      .style("display", "block")
      .style("font", "700 14px 'Helvetica Neue'")
      .style("width", "50%")
      .style("max-width", `${window.screen.height}px`)
      .style("height", "auto")
      .style("margin", "auto");
  
  
    const field = svg.append("g")
     .attr("transform", `translate(${width / 2},${height / 2})`)
    .selectAll("g")
    .data(fields)
    .enter().append("g");

  field.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .attr("r", d => d.radius);
  
  

  const fieldTick = field.selectAll("g")
      .data(d => {
        console.log(d.string);
        const processed_data = range(1, circleCount);
        return processed_data.map(x => ({x: x, field: d}));
      })
    .enter().append("g")
      .attr("class", "field-tick")
      .attr("transform", (d, i) => {
   
        const angle = i * (getAngle() * Math.PI / 180) * 2 * Math.PI - Math.PI / 2;
        console.log(angle);
        return `translate(${Math.cos(angle) * d.field.radius}, ${Math.sin(angle) * d.field.radius})`;
      });
  
 
  // Add circles to all the blank gaps 
  const fieldCircle = fieldTick.append("circle")
      .attr("r", dotRadius * 2)
      .attr("fill", "green");

 
  
      return svg.node();
  
}
)
    },
    {
      name: "circleCount",
      inputs: ["inputText"],
      value: (function(inputText){return(
inputText.length
)})
    },
    {
      name: "fields",
      inputs: ["radius","inputText"],
      value: (function(radius,inputText){return(
[
  {radius: 0.8 * radius, string: inputText}
]
)})
    },
    {
      name: "range",
      value: (function(){return(
function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}
)})
    },
    {
      name: "getAngle",
      inputs: ["inputAngle"],
      value: (function(inputAngle){return(
function getAngle() {
   if (inputAngle.length === 0) {
     return 100;
   }
   else 
   {
     return inputAngle;
   }
 }
)})
    },
    {
      name: "width",
      value: (function(){return(
500
)})
    },
    {
      name: "height",
      inputs: ["width"],
      value: (function(width){return(
width
)})
    },
    {
      name: "radius",
      inputs: ["width"],
      value: (function(width){return(
width / 1.67
)})
    },
    {
      name: "dotRadius",
      inputs: ["radius"],
      value: (function(radius){return(
radius / 22 - 8
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
      from: "@jashkenas/inputs",
      name: "color",
      remote: "color"
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
    },
    {
      name: "color",
      inputs: ["input"],
      value: (function(input){return(
function color(config = {}) {
  let {value, title, description, submit, display} = config;
  if (typeof config == "string") value = config;
  if (value == null) value = '#000000';
  const form = input({
    type: "color", title, description, submit, display,
    attributes: {value}
  });
  if (title || description) form.input.style.margin = "5px 0";
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

const notebook = {
  id: "931ef38e43d6f38e@354",
  modules: [m0,m1]
};

export default notebook;
