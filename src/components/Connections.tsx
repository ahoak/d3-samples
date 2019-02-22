import * as React from 'react'
import { select, selectAll } from 'd3-selection'
import { linkHorizontal } from 'd3-shape'

const ODD = 'rgba(100,100,150,0.4)'
const EVEN = 'rgba(100,100,120,0.2)'

// D3 Component 
export default class AnnotatedConnectors extends React.Component<any, any> {
	private svgElement: SVGElement
	constructor(props: any) {
		super(props)
	}


	public componentDidMount() {
		this.enter()
		
	}
	public componentDidUpdate() {
		this.enter()
	}


	private enter() {

		const { height, startingHeight, width, sourceConn, targetHeight, targetBottom } = this.props

		const svg = select(this.svgElement)
			.attr('class', 'svg')
			.attr('width', width)
			.attr('height', height)
		const link = linkHorizontal()

        const wordIds = Object.keys(sourceConn)

		const p = (d: any) => {
			if (sourceConn[d] !== undefined) {
				return (
					link({
						source: [0, (sourceConn[d].top - startingHeight + 2) + 0.5 * (sourceConn[d].bottom - sourceConn[d].top)],
						target: [width - 50, (targetHeight - startingHeight ) + 0.5*(targetBottom - targetHeight) ]
					})
				)
			}
			return null
        }
            selectAll('.anno-connector-path').remove()
            selectAll('.anno-connectors-lines').remove()
        if(wordIds.length > 0) {
            svg
                .selectAll('.anno-connector-path')
                .data(wordIds)
                .enter()
                .append('path')
                .attr('class', 'anno-connector-path')
                .attr('stroke', '#888')
                .attr('fill', 'none')
                .attr('d', p)
                .attr('stroke-opacity',  0.2)

            svg.attr('class', 'anno-connectors-lines')
                .selectAll('.anno-connector-lines')
                .data(wordIds)
                .enter()
                .append('line')
                .attr('class', 'anno-connector-lines')
                .style('stroke', (d: any, i: number) => i % 2 === 0 ? EVEN : ODD)
                .attr('fill', 'none')
                .attr('x1', 0)
                .attr('y1', (d: any) => {
                    if (sourceConn[d]) {
                        return (
                            (sourceConn[d].top - startingHeight) + 2
                        )
                    }
                    return null
                })
                .attr('x2', 0)
                .attr('y2', (d: any) => {
                    if (sourceConn[d]) {
                        return (
                            (sourceConn[d].bottom - startingHeight) - 2
                        )
                    }
                    return null
                })

            }
		

	}



	
	public render() {
		return (
		<>
			<div style={{  display: 'absolute', top:  0 }}>
				<svg ref={(e) => (this.svgElement = (e as SVGElement))} width={this.props.width} height={500} style={{position: 'absolute', top: this.props.startingHeight, left: this.props.startingWidth}}/>
			</div>
		</>
		)
	}
}