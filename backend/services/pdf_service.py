from uuid import uuid4

from models import Section


def parse_pdf(pdf_path: str) -> tuple[list[Section], int]:
    from docling.document_converter import DocumentConverter
    from docling_core.transforms.chunker.hierarchical_chunker import HierarchicalChunker

    converter = DocumentConverter()
    result = converter.convert(pdf_path)
    doc = result.document

    page_count = len(doc.pages)

    chunker = HierarchicalChunker()
    chunks = list(chunker.chunk(dl_doc=doc))

    sections = []
    for chunk in chunks:
        page_nos = sorted(set(
            item.prov[0].page_no
            for item in chunk.meta.doc_items
            if item.prov
        ))
        label = chunk.meta.doc_items[0].label.value if chunk.meta.doc_items else "paragraph"
        sections.append(Section(
            id=str(uuid4()),
            text=chunk.text,
            headings=chunk.meta.headings or [],
            page_nos=page_nos,
            label=label,
            audio_status="pending"
        ))

    return sections, page_count
