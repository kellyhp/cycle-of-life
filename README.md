# Cycle of Life

## Software Functionalities:

This project consists of several visualizations implemented using D3.js, each providing insights into various aspects of global health and socio-economic status. Here are the functionalities of each visualization:

1. **Choropleth Map (World Map of Life Expectancy):**
   - This visualization depicts a world map where countries are color-coded based on life expectancy.
   - Users can hover over each country to view detailed information such as life expectancy and other relevant metrics.
   - The data used for this visualization is stored in CSV files located in the `data` folder.

2. **Bubble Chart (Average Global Life Expectancy, Unemployment, and Undernourishment; Average Global Infant Deaths, Polio Immunizations, and GDP):**
   - This visualization presents a bubble chart comparing average global life expectancy, unemployment, undernourishment, infant deaths, polio immunizations, and GDP.
   - Bubble size represents the magnitude of each metric, providing a visual comparison across different factors.
   - Users can interact with the bubbles to view specific data points and compare different metrics.
   - The data for this visualization is sourced from CSV files stored in the `data` folder.

3. **Arc Diagram (Global Count of Infant Deaths linked with Unemployment within 2015; Global Count of Life Expectancy linked with Unemployment within 2015):**
   - The arc diagram illustrates the relationship between infant deaths/life expectancy and the unemployment rates within 2015.
   - Users can explore the connections between these factors through interactive arcs and nodes.
   - Hovering over nodes or arcs reveals additional information about the linked data points.
   - Data for this visualization is also stored in CSV files located in the `data` folder.

## User Instructions:

To view each visualization, follow these steps:

1. **Clone the Repository:**
   - Clone this repository to your local machine using the following command:
     ```
     git clone https://github.com/kellyhp/cycle-of-life.git
     ```

2. **Navigate to Visualizations:**
   - Open the repository in your code editor.
   - Navigate to the `data` folder and ensure that all required CSV files are present.

3. **Run a Local Server:**
   - Use a local server extension in your code editor (e.g., Live Server in Visual Studio Code) to launch the visualizations.
   - Navigate to each HTML file representing a visualization (e.g., `choroplethLE.html`, `bubble.html`, `arcdiagram.html`) in your web browser.

4. **Explore the Visualizations:**
   - Interact with each visualization by hovering over elements or clicking on bubbles/arcs to view detailed information.
   - Compare different metrics and gain insights into global health and socio-economic trends.

By following these instructions, you can explore the visualizations and gain valuable insights into various aspects of global health and socio-economic status.