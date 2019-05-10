// URL: https://observablehq.com/@smsaladi/polar-clock-edited
// Title: Polar Clock (Edited 2019-04-19)
// Author: Shyam Saladi (@smsaladi)
// Version: 314
// Runtime version: 1

const m0 = {
  id: "a1dee6cad0367e80@314",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`# Polar Clock (Edited 2019-04-19)`
)})
    },
    {
      from: "@jashkenas/inputs",
      name: "slider",
      remote: "slider"
    },
    {
      name: "configuredSlider",
      inputs: ["slider"],
      value: (function(slider){return(
slider({
  min: 0, 
  max: 360, 
  step: 1
})
)})
    },
    {
      inputs: ["d3","DOM","width","height","fields","circleCount","dotRadius","color"],
      value: (function(d3,DOM,width,height,fields,circleCount,dotRadius,color)
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
    .enter(); // .append("g");

  // outline of circle in back
  field.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .attr("r", d => d.radius);
  

  const fieldTick = field.selectAll("g")
      .data(d => {
        // process d.string into an array
        console.log(d);
        const processed_data = [1, 2, 3, 4, 5, 6, 7];
        return processed_data.map(x => ({x: x, field: d}));
      })
    .enter().append("g")
      .attr("class", "field-tick")
      .attr("transform", (d, i) => {
        const angle = i / circleCount * 2 * Math.PI - Math.PI / 2;
        return `translate(${Math.cos(angle) * d.field.radius}, ${Math.sin(angle) * d.field.radius})`;
      });

  // Add circles to all the blank gaps 
  const fieldCircle = fieldTick.append("circle")
      .attr("r", dotRadius)
      .attr("fill", "green")
      .style("color", (d, i) => color(i / circleCount * 2 * Math.PI));

  // const fieldFocus = field.append("circle")
  //     .attr("r", dotRadius)
  //     .attr("fill", "white")
  //     .attr("stroke", "#000")
  //     .attr("stroke-width", 3)
  //     .attr("cy", d => -d.radius)
  //     .style("transition", "transform 500ms ease");
  
  // trying to add text
//   fieldTick.append("text")
//       .attr("dy", "0.35em")
//       .attr("fill", "#222")
//       .text(d => d.field.format(d.time).slice(0, 2));
  
  return svg.node();

  //yield update(Math.floor((Date.now() + 1) / 1000) * 1000);
  
//   while (true) {
//     const then = Date.now()
//     // const then = Math.ceil((Date.now() + 1) / 1000) * 1000;
//     yield Promises.when(then, then).then(update);
//   }
  
//   function update(then) {
//     for (const d of fields) {
//       const start = d.interval(then);
//       const index = d.subinterval.count(start, then);
//       fieldFocus.attr("transform", d => `rotate(${(100 / d.range.length + d.cycle) * 360})`);
//       d.index = index;
//     }
//     return svg.node();
//   }

}
)
    },
    {
      name: "fields",
      inputs: ["radius","d3"],
      value: (function(radius,d3){return(
[
  {radius: radius, interval: d3.timeMinute, subinterval: d3.timeSecond, format: d3.timeFormat(""),
   string: 'XXXXXX'}
]
)})
    },
    {
      name: "circleCount",
      value: (function(){return(
23
)})
    },
    {
      name: "width",
      value: (function(){return(
2000
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
      name: "armRadius",
      inputs: ["radius"],
      value: (function(radius){return(
radius / 22
)})
    },
    {
      name: "dotRadius",
      inputs: ["armRadius"],
      value: (function(armRadius){return(
armRadius - 9
)})
    },
    {
      name: "color",
      inputs: ["d3"],
      value: (function(d3){return(
d3.scaleSequential(d3.interpolateRainbow).domain([0, 2 * Math.PI])
)})
    },
    {
      name: "arcArm",
      inputs: ["d3","armRadius"],
      value: (function(d3,armRadius){return(
d3.arc()
    .startAngle(d => armRadius / d.radius)
    .endAngle(d => -Math.PI - armRadius / d.radius)
    .innerRadius(d => d.radius - armRadius)
    .outerRadius(d => d.radius + armRadius)
    .cornerRadius(armRadius)
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
      name: "ax",
      inputs: ["require"],
      value: (function(require){return(
require("d3-axis")
)})
    }
  ]
};

const m1 = {
  id: "@jashkenas/inputs",
  variables: [
    {
      name: "slider",
      inputs: ["input"],
      value: (function(input){return(
function slider(config = {}) {
  let {value, min = 0, max = 1, step = "any", precision = 2, title, description, getValue, format, display, submit} = config;
  if (typeof config == "number") value = config;
  if (value == null) value = (max + min) / 2;
  precision = Math.pow(10, precision);
  if (!getValue) getValue = input => Math.round(input.valueAsNumber * precision) / precision;
  return input({
    type: "range", title, description, submit, format, display,
    attributes: {min, max, step, value},
    getValue
  });
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
  id: "a1dee6cad0367e80@314",
  modules: [m0,m1]
};

export default notebook;
