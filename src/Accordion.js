import { Children, useState } from "react"

export const Accordion = () => {
    const data = {
        parent1: {
            title: "parent-1",
            Children: [
                {
                    title: "parent-1.1",
                    Children: [
                        {
                            title: "parent-1.1.1",
                            Children: []
                        }
                    ]
                },
                {
                    title: "parent-1.2",
                    Children: []
                }
            ]
        },
        parent2: {
            title: "parent-2",
            Children: [
                {
                    title: "parent-2.1",
                    Children: [
                        {
                            title: "parent-2.1.1",
                            Children: []
                        }
                    ]
                },
                {
                    title: "parent-2.2",
                    Children: []
                }
            ]
        }
    };
    const RenderAccordionItem = ({item}) => {
        const [isOpen, setIsOpen] = useState(false)

        return (
            <div>
                <button onClick={() => setIsOpen(!isOpen)}>{item.title} {item.Children.length > 0 && (isOpen ? "▼" : "▶")}</button>
                {isOpen && item.Children.length > 0 && (
                    <div>
                        {item.Children.map((data,index) => (
                            <RenderAccordionItem item={data} key={index}/>
                        ))}
                    </div>
                )}
            </div>
        )
    }
    return (
        <div className="nestedAccordion">
            {
                data && (
                    Object.keys(data).map((key) => (
                        <div key={key}>
                            <RenderAccordionItem item={data[key]}/>
                            {/* {renderAccordionItem(data[key])} */}
                        </div>
                    ))
                )
            }
        </div>
    )
}