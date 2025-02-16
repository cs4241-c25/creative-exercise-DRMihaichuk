const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let shapes =
`<svg width=100% height=100% xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="RedMag" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ff0000" />
            <stop offset="100%" stop-color="#ff00ff" />
        </linearGradient>

        <linearGradient id="BlueMag" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0000ff" />
            <stop offset="100%" stop-color="#ff00ff" />
        </linearGradient>

        <linearGradient id="RedYell" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ff0000" />
            <stop offset="100%" stop-color="#ffff00" />
        </linearGradient>

        <linearGradient id="GreenYell" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#00ff00" />
            <stop offset="100%" stop-color="#ffff00" />
        </linearGradient>

        <linearGradient id="BlueCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0000ff" />
            <stop offset="100%" stop-color="#00ffff" />
        </linearGradient>
    </defs>

    <circle cx="950" cy="50" r="40" fill="url(#RedMag)" id="circle"/>
    <rect width="200" height="100" x="500" y="400" fill="url(#BlueMag)" id="rectangle"/>
    <polygon points="100,300 150,390 50,390" fill="url(#RedYell)" id="triangle"/>
    <polygon points="550,15 658,77 658,202 550,265 442,202 442,77" fill="url(#GreenYell)" id="hexagon"/>
    <polygon points="100,10 40,198 190,78 10,78 160,198" fill="url(#BlueCyan)" id="star"/>
</svg>`

async function run() {

    app.get('/', (req, res) => {
        res.sendFile(__dirname + "/index.html")
    })

    app.get('/svg', (req, res) => {
        res.json({ svg: shapes });
    });

    app.post('/update-star-size', (req, res) => {
        const data = req.body;
        const size = data.size;

        const polygonRegex = /<polygon[^>]+id="star"[^>]*>/;
        const polygonMatch = shapes.match(polygonRegex);

        if (polygonMatch) {
            // Extract the points from the polygon
            const polygonString = polygonMatch[0];
            let points = extractPoints(polygonString);

            // Scale the points based on the random size
            const scaledPoints = scalePoints(points, size);

            // Rebuild the points attribute
            const pointsAttribute = scaledPoints.map(point => `${point.x},${point.y}`).join(' ');

            // Replace the old polygon with the new one
            shapes = shapes.replace(
                polygonString,
                `<polygon points="${pointsAttribute}" fill="url(#BlueCyan)" id="star"/>`
            );

            res.json({ svg: shapes });
        }
    });
}
const appRun = run();

function scalePoints(points, size) {
    const pnts = points.map(point => ({
        x: point.x * size,
        y: point.y * size
    }));
    return pnts;
}

function extractPoints(polygonString) {
    const pointsString = polygonString.match(/points="([^"]+)"/)[1];
    return pointsString.split(' ').map(point => {
        const [x, y] = point.split(',').map(Number);
        return { x, y };
    });
}

app.listen(process.env.PORT || 3000);