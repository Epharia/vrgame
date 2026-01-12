import * as THREE from "three";
import { CONFIG } from "../config.mjs";
import { Engine } from "../engine/engine.mjs";

export class BlinkTeleportSystem {
    constructor(player) {
        this.player = player;
        this.colliders = null;

        this.isActive = false;
        this.isValidTarget = false;
        this.targetPosition = new THREE.Vector3();
        this.cooldownTimer = 0;

        this.arcLine = null;
        this.reticle = null;

        this._tempVec = new THREE.Vector3();
        this._tempVec2 = new THREE.Vector3();
        this._raycaster = new THREE.Raycaster();

        this.setupVisuals();
    }

    /**
     * Sets up the visual elements for the teleport system
     */
    setupVisuals() {
        //TODO this needs refactoring (use resource manager etc. but right now i'm DONE!!!)
        const arcPoints = [];
        const segments = CONFIG.settings.vr.blinkTeleport.arcSegments;

        for (let i = 0; i <= segments; i++) {
            arcPoints.push(new THREE.Vector3());
        }

        const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
        const arcMaterial = new THREE.LineBasicMaterial({
            color: CONFIG.settings.vr.blinkTeleport.validColor,
            linewidth: 3,
        });

        this.arcLine = new THREE.Line(arcGeometry, arcMaterial);
        this.arcLine.visible = false;
        Engine.scene.add(this.arcLine);

        const reticleGeometry = new THREE.RingGeometry(
            CONFIG.settings.vr.blinkTeleport.reticleSize * 0.8,
            CONFIG.settings.vr.blinkTeleport.reticleSize,
            32
        );
        const reticleMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.settings.vr.blinkTeleport.validColor,
            side: THREE.DoubleSide,
        });

        this.reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
        this.reticle.rotation.x = -Math.PI / 2;
        this.reticle.visible = false;
        Engine.scene.add(this.reticle);
    }

    /**
     * Sets the collision data for validating teleport positions
     * @param {THREE.Box3[]} colliders - Array of collision boxes
     */
    setColliders(colliders) {
        this.colliders = colliders;
    }

    /**
     * Starts the teleport targeting mode
     * @param {THREE.XRTargetRaySpace} controller - The VR controller
     */
    startTargeting(controller) {
        if (this.cooldownTimer > 0) return;

        this.isActive = true;
        this.arcLine.visible = true;
        this.reticle.visible = true;
    }

    /**
     * Stops targeting and executes teleport if valid
     */
    stopTargeting() {
        if (!this.isActive) return;

        this.isActive = false;
        this.arcLine.visible = false;
        this.reticle.visible = false;

        if (this.isValidTarget) {
            this.executeTeleport();
        }
    }

    /**
     * Checks if a position is valid
     * @param {THREE.Vector3} position - Position to check
     * @returns {boolean} Whether the position is valid
     */
    isPositionValid(position) {
        if (!this.colliders || !this.player.collider) return true;

        const radius = this.player.collider.radius;

        for (const box of this.colliders) {
            box.clampPoint(position, this._tempVec);

            const dx = position.x - this._tempVec.x;
            const dz = position.z - this._tempVec.z;
            const dist2 = dx * dx + dz * dz;

            if (dist2 < radius * radius) {
                return false;
            }
        }

        return true;
    }

    /**
     * Updates the teleport arc visualization.
     * @param {THREE.XRTargetRaySpace} controller - The VR controller
     */
    updateArc(controller) {
        //TODO this is a mess but works somewhat idk, it needs to be refactored at some poin
        // -> remove fragments
        // -> simplify
        // -> locate and fix disapearing line bug
        // or just redo it but right this time
        if (!this.isActive || !controller) return;

        const positions = this.arcLine.geometry.attributes.position.array;
        const segments = CONFIG.settings.vr.blinkTeleport.arcSegments;
        const maxDistance = CONFIG.settings.vr.blinkTeleport.maxDistance;
        const arcHeight = CONFIG.settings.vr.blinkTeleport.arcHeight;

        controller.getWorldPosition(this._tempVec);
        controller.getWorldDirection(this._tempVec2);

        const startPos = this._tempVec.clone();
        const direction = this._tempVec2.clone().negate().normalize();

        const horizontalDir = new THREE.Vector3(direction.x, 0, direction.z);
        const horizontalLength = horizontalDir.length();

        if (horizontalLength < 0.01) {
            horizontalDir.set(0, 0, -1);
        } else {
            horizontalDir.normalize();
        }
        const forwardAngle = Math.atan2(direction.x, direction.z);

        const pitchAngle = Math.asin(direction.y);
        const initialVelocity = maxDistance * 0.5;
        const gravity = arcHeight * 2;

        let finalPoint = new THREE.Vector3();
        let hitGround = false;
        let hitWall = false;
        let actualSegments = segments;
        let prevY = startPos.y;
        let prevT = 0;
        let prevPoint = new THREE.Vector3();

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * 3;

            const horizontalDist = initialVelocity * Math.cos(pitchAngle) * t;

            const verticalPos = startPos.y +
                (initialVelocity * Math.sin(pitchAngle) * t) -
                (0.5 * gravity * t * t);

            const x = startPos.x + horizontalDir.x * horizontalDist;
            const y = verticalPos;
            const z = startPos.z + horizontalDir.z * horizontalDist;

            const currentPoint = new THREE.Vector3(x, y, z);

            if (i > 0 && this.colliders && y > 0.1) {
                const segmentDir = new THREE.Vector3().subVectors(currentPoint, prevPoint);
                const segmentLength = segmentDir.length();

                if (segmentLength > 0.001) {
                    segmentDir.normalize();
                    this._raycaster.set(prevPoint, segmentDir);

                    for (const box of this.colliders) {
                        const intersection = this._raycaster.ray.intersectBox(box, this._tempVec);
                        if (intersection) {
                            const intersectDist = prevPoint.distanceTo(intersection);
                            if (intersectDist <= segmentLength + 0.1) {
                                hitWall = true;
                                actualSegments = Math.max(0, i - 1);

                                if (i > 0) {
                                    finalPoint.copy(prevPoint);
                                } else {
                                    finalPoint.copy(startPos);
                                }

                                for (let j = i; j <= segments; j++) {
                                    positions[j * 3] = finalPoint.x;
                                    positions[j * 3 + 1] = finalPoint.y;
                                    positions[j * 3 + 2] = finalPoint.z;
                                }
                                break;
                            }
                        }
                    }

                    if (hitWall) break;
                }
            }

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            if (y <= 0.01 && !hitGround && !hitWall) {
                hitGround = true;
                actualSegments = i;

                if (i > 0 && prevY > 0.01) {
                    const ratio = (prevY - 0.01) / (prevY - y);
                    const interpT = prevT + (t - prevT) * ratio;
                    const interpDist = initialVelocity * Math.cos(pitchAngle) * interpT;

                    finalPoint.set(
                        startPos.x + horizontalDir.x * interpDist,
                        0.01,
                        startPos.z + horizontalDir.z * interpDist
                    );
                } else {
                    finalPoint.set(x, 0.01, z);
                }

                for (let j = i + 1; j <= segments; j++) {
                    positions[j * 3] = finalPoint.x;
                    positions[j * 3 + 1] = 0.01;
                    positions[j * 3 + 2] = finalPoint.z;
                }
                break;
            }

            prevY = y;
            prevT = t;
            prevPoint.copy(currentPoint);
        }

        if (!hitGround && !hitWall) {
            finalPoint.set(
                positions[(segments - 1) * 3],
                0.01,
                positions[(segments - 1) * 3 + 2]
            );
        }

        this.targetPosition.copy(finalPoint);
        this.targetPosition.y = CONFIG.settings.player.height;
        this.isValidTarget = !hitWall && this.isPositionValid(this.targetPosition);

        const color = this.isValidTarget
            ? CONFIG.settings.vr.blinkTeleport.validColor
            : CONFIG.settings.vr.blinkTeleport.invalidColor;

        this.arcLine.material.color.setHex(color);

        if (hitWall) {
            this.reticle.visible = false;
        } else {
            this.reticle.visible = true;
            this.reticle.material.color.setHex(color);
            this.reticle.position.copy(finalPoint);
        }

        this.arcLine.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * Executes the teleport to the target position
     */
    executeTeleport() {
        if (!this.isValidTarget) return;

        this.player.setPosition(this.targetPosition);
        this.cooldownTimer = CONFIG.settings.vr.blinkTeleport.cooldown;
    }

    /**
     * Updates
     * @param {number} dt - Delta time
     * @param {THREE.XRTargetRaySpace} controller - The VR controller
     */
    update(dt, controller) {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= dt;
        }

        if (this.isActive) {
            this.updateArc(controller);
        }
    }

    /**
     * Disposes resources
     */
    dispose() {
        Engine.scene.remove(this.arcLine);
        Engine.scene.remove(this.reticle);

        this.arcLine.geometry.dispose();
        this.arcLine.material.dispose();
        this.reticle.geometry.dispose();
        this.reticle.material.dispose();
    }
}
