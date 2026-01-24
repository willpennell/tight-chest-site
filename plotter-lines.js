// Generative art: Pixelated root-like growth
(function() {
    const container = document.querySelector('.art-canvas');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.shapeRendering = 'geometricPrecision';
    container.appendChild(svg);

    const lines = [];
    const numLines = 1;
    // Random starting position on each page load - constrained to center area
    const centerX = 30 + Math.random() * 40;
    const centerY = 30 + Math.random() * 40;

    class GrowingLine {
        constructor(startX, startY, angle, speed, depth = 0) {
            this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.path.setAttribute('stroke', '#000000');
            this.path.setAttribute('stroke-width', '0.2');
            this.path.setAttribute('fill', 'none');
            this.path.setAttribute('opacity', '1');
            this.path.setAttribute('stroke-linecap', 'round');
            svg.appendChild(this.path);

            this.angle = angle;
            this.speed = speed;
            this.points = [{x: startX, y: startY}];
            this.length = 0;
            this.maxLength = 15 + Math.random() * 25;
            this.noiseOffset = Math.random() * 1000;
            this.time = 0;
            this.depth = depth;
            this.hasBranched = false;
            this.age = 0;
            this.lifespan = 800 + Math.random() * 600;
            this.isDead = false;
        }

        update() {
            this.time += 0.0005;
            this.age++;

            if (this.length < this.maxLength) {
                this.length += this.speed;

                // Organic, wavy movement like pen plotter
                const noise1 = Math.sin(this.time * 8 + this.noiseOffset) * 0.15;
                const noise2 = Math.cos(this.time * 12 + this.noiseOffset * 1.5) * 0.1;
                const noise3 = Math.sin(this.time * 15 + this.noiseOffset * 2) * 0.05;

                const angleVariation = noise1 + noise2 + noise3;
                const currentAngle = this.angle + angleVariation;

                const lastPoint = this.points[this.points.length - 1];
                const distance = 0.3; // Very small steps for smooth lines

                const newX = lastPoint.x + Math.cos(currentAngle) * distance;
                const newY = lastPoint.y + Math.sin(currentAngle) * distance;

                this.points.push({x: newX, y: newY});

                // Branch off at random points along the line
                if (this.length > 2 && Math.random() < 0.08 && this.depth < 3) {
                    this.branch(newX, newY);
                }
            }

            // Fade out over time
            if (this.age > this.lifespan) {
                const fadeProgress = (this.age - this.lifespan) / 200;
                const opacity = Math.max(0, 1 - fadeProgress);
                this.path.setAttribute('opacity', opacity);

                if (opacity <= 0) {
                    this.isDead = true;
                }
            }

            // Build path with pixelated lines
            if (this.points.length > 1) {
                let pathData = `M ${this.points[0].x.toFixed(1)} ${this.points[0].y.toFixed(1)}`;
                for (let i = 1; i < this.points.length; i++) {
                    pathData += ` L ${this.points[i].x.toFixed(1)} ${this.points[i].y.toFixed(1)}`;
                }
                this.path.setAttribute('d', pathData);
            }
        }

        branch(x, y) {
            // Create organic branches at various angles
            const branchAngle = this.angle + (Math.random() - 0.5) * Math.PI / 1.5;
            const branchSpeed = this.speed;
            lines.push(new GrowingLine(x, y, branchAngle, branchSpeed, this.depth + 1));
        }

        isDone() {
            return this.length >= this.maxLength;
        }
    }

    // Initialize lines with completely random direction
    for (let i = 0; i < numLines; i++) {
        const angle = Math.random() * Math.PI * 2; // Any direction
        const speed = 0.01 + Math.random() * 0.01;
        lines.push(new GrowingLine(centerX, centerY, angle, speed, 0));
    }

    let lastSpawnTime = Date.now();
    const spawnInterval = 2000;

    function animate() {
        lines.forEach(line => line.update());

        // Remove dead lines
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].isDead) {
                lines[i].path.remove();
                lines.splice(i, 1);
            }
        }

        const now = Date.now();
        // Always maintain at least 1 main growing line
        const growingMainLines = lines.filter(line => line.length < line.maxLength && line.depth === 0).length;

        // Force spawn if no main lines exist
        if (growingMainLines === 0 || (now - lastSpawnTime > spawnInterval && growingMainLines < 1)) {
            const angle = Math.random() * Math.PI * 2; // Completely random direction
            const speed = 0.01 + Math.random() * 0.01;
            lines.push(new GrowingLine(centerX, centerY, angle, speed, 0));
            lastSpawnTime = now;
        }

        requestAnimationFrame(animate);
    }

    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    animate();
})();
