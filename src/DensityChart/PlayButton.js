import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Button from "antd/es/button";

export default class PlayButton extends PureComponent {

    static propTypes = {
        width: PropTypes.number.isRequired,
        brushDomainMax: PropTypes.oneOfType([
            PropTypes.instanceOf(Date),
            PropTypes.number
        ]).isRequired,
        brushDomainMin: PropTypes.oneOfType([
            PropTypes.instanceOf(Date),
            PropTypes.number
        ]).isRequired,
        frameStep: PropTypes.number.isRequired,
        frameDelay: PropTypes.number.isRequired,
        densityChartXScale: PropTypes.func.isRequired,
        moveBrush: PropTypes.func.isRequired
    };

    state = {
        play: false
    };

    /**
     * Handles click on play button. Defines start and end for
     * the domain-lapse and triggers _playLapse to play frames
     * at set intervals.
     *
     * @private
     */
    _onClickPlay = () => {
        const { width, densityChartXScale, brushDomainMax, brushDomainMin, frameStep } = this.props;
        const brushedMaxRange = densityChartXScale(brushDomainMax);
        const brushedMinRange = densityChartXScale(brushDomainMin);
        const frameStart = brushedMinRange;

        const playEnd = width;
        const playStep = width * frameStep;

        this.frameEnd = frameStart;

        if (brushedMaxRange === playEnd || brushedMaxRange === frameStart){
            this.frameEnd = frameStart;
        } else {
            this.frameEnd = brushedMaxRange;
        }

        this.setState({
            play: true
        }, () => this._playLapseAtInterval(frameStart, playEnd, playStep));
    };

    /**
     * Handles click on stop button. Will clear interval
     * of funtion playInterval playing domain-lapse frames
     *
     * @private
     */
    _onClickStop = () => {
        this._stopLapse();
    };

    /**
     * Plays a frame of the domain-lapse. Updates subset of domain
     * to be displayed and moves brush to new domain.
     *
     * @param {Number} start
     * @param {Number} end
     * @param {Number} step
     * @private
     */
    _playFrame(start, end, step){
        // If end of frame is at end of play region then stop domain-lapse

        if (this.frameEnd >= end) {
            this._stopLapse();
            return;
        }

        // Check if adding a step will surprass max domain.
        if (this.frameEnd + step >= end) {
            // If so, set max frame to be max domain
            this.frameEnd = end;
        } else {
            // Otherwise just add a step
            this.frameEnd += step;
        }
        const domain = [start, this.frameEnd];

        // Move brush to new frame location
        this.props.moveBrush(domain);
    }

    /**
     * Plays domain-lapse by calling _playFrame at interval
     * to play each frame.
     *
     * @param {Number} start
     * @param {Number} end
     * @param {Number} step
     * @private
     */
    _playLapseAtInterval(start, end, step){
        this.playInterval = setInterval(() => {
            this._playFrame(start, end, step);
        }, this.props.frameDelay);
    }

    /**
     *  Stops domain-lapse at current frame. This
     * is done by clearing the timeInterval in this.playInterval.
     *
     * @private
     */
    _stopLapse() {
        this.setState({
            play: false
        }, () => clearInterval(this.playInterval));
    }

    render() {
        const buttonProps = {
            icon: this.state.play ? "pause-circle" : "play-circle",
            onClick: this.state.play ? this._onClickStop : this._onClickPlay
        };

        return (<Button {...buttonProps} className="fdz-css-play-btn"/>);
    }
}
